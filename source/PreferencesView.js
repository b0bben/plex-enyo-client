enyo.kind({
	name: "plex.PreferencesView",
	kind: enyo.VFlexBox,
	className: "basic-back",
	published: {
		browserPreferences: {},
		systemPreferences: {},
		searchPreferences: [],
		defaultSearch: ""
	},
	events: {
		onPreferenceChanged: "",
		onClose: ""
	},
	components: [
		{kind: enyo.Pane, flex: 1, components: [
			{name: "serverForm", kind: "plex.ServerFormView", onSave: "newServerAdded", onDelete: "serverRemoved",onCancel: "backHandler", lazy: true, showing: false},
			{name: "myPlexForm", kind: "plex.MyPlexFormView", onLoggedIn: "loggedInToMyPlex", onLoggedOut: "logoutFromMyPlex",onCancel: "backHandler", lazy: true, showing: false},

			{name: "mainPrefs", kind: enyo.Control, layoutKind: "VFlexLayout", components:[
				{name: "header", kind: "PageHeader", className: "preferences-header", pack: "center", components: [
					{kind: "Image", src: "images/PlexIcon.png", className: "preferences-header-image"},
					{content: $L("Preferences")}
				]},
				{kind: "Scroller", flex: 1, components: [
					{kind: "Control", className: "enyo-preferences-box", components: [
						//myplex login
						{kind: "RowGroup", name: "myplexLogin", caption: "myPlex details", components: [
							{kind: enyo.Item, name: "myplexLoginItem", onclick: "myplexLoginItemTap",showing: false, layoutKind: "HFlexLayout", tapHighlight: true},
							{name: "loginButton", content: $L("Login to myPlex ..."), onclick: "showMyPlexForm"},
						]},

						//myplex PMSes
						{kind: "RowGroup", caption: $L("Servers shared via myPlex"), style: "margin-bottom: 10px", components: [
							{name: "myPlexServerList", kind:enyo.VirtualRepeater, style: "margin: -10px;", onSetupRow: "listMyPlexSetupRow",components: [
								{kind: enyo.Item, className: "server-list-item", tapHighlight: true, layoutKind: "HFlexLayout", components: [
									{kind: "LabeledContainer", flex: 1, name: "myPlexServerName",label: "Server nr 1"},
									{name: "onlineStatus", content: "", className: "enyo-label"},
								]}
							]}
						]},
						{content:$L("Use myPlex to access servers shared with you"), className: "prefs-body-text", style:"margin:none;"},
						
						//local PMSes
						{kind: "RowGroup", caption: $L("Servers on your network"), style: "margin-bottom: 10px", components: [
							{name: "serverList", kind:enyo.VirtualRepeater, style: "margin: -10px;", onSetupRow: "listSetupRow",components: [
								{kind: enyo.Item, onclick: "listItemTap", className: "server-list-item",layoutKind: "HFlexLayout", components: [
									{name: "serverName", label: "Server nr 1", flex: 1},
								]},
							]},
							//{kind: enyo.Item, className: "server-list-item", layoutKind: "HFlexLayout", components: [
								//{content: $L("Add new network server ..."), onclick: "showAddServerForm"},
							//]},
						]},
						{content:$L("All servers set to 'Show' will be available for browsing."), className: "prefs-body-text", style:"margin:none;"},

						/*
						{kind: "RowGroup", caption: $L("Autofill"), components: [
							{kind: "LabeledContainer", caption: $L("Names and Passwords"), components: [
								{kind: "ToggleButton", name: "rememberPasswords", onChange: "togglePreferenceClick", preference: "rememberPasswords"}
							]}
						]},
						{kind: "Button", caption: $L("Clear Autofill Information"), onclick: "", dialog: ""},
						*/
						{kind: "RowGroup", caption: $L("Video quality"), components: [
							{kind: "ListSelector", name: "videoQuality", value: 1, onChange: "videoQualityChanged", items: [
								{caption: $L("10 Mbps, 1080p"), value: 11},
								{caption: $L("8 Mbps, 1080p"), value: 10},
								{caption: $L("5 Mbps, 1080p"), value: 9},
								{caption: $L("4 Mbps, 720p"), value: 8},
								{caption: $L("3 Mbps, 720p"), value: 7},
								{caption: $L("2 Mbps, 720p"), value: 6},
								{caption: $L("1.5 Mbps, 480p"), value: 5},
								{caption: $L("720 kbps, 320p"), value: 4},
								{caption: $L("320 kbps, 240p"), value: 3},
							]}
						]},
						{content:$L('Higher quality settings provide better looking video, but require more network bandwith.'), className: "prefs-body-text", style:"margin-bottom:8px"},
					]},
					{name: "console", kind: "HtmlContent", style: "font-size: 10pt; background-color: white; display:none;"},
				]},
				{kind: "Toolbar", pack: "center", className: "enyo-toolbar-light", components: [
		 	   	{kind: "Button", caption: $L("Done"), onclick: "doClose", className: "enyo-preference-button enyo-button-affirmative"}
				]},
			]}
		]},			
	],
	create: function() {
		this.inherited(arguments);
		this.reloadPrefs();
		this.$.pane.selectViewByName("mainPrefs");
		//refresher that watches the server list for reachability
		this.intervarlTimerId = setInterval(enyo.bind(this, this.checkServerReachability), 5000);
	},
	reloadPrefs: function() {
		window.PlexReq.loadPrefsFromCookie();
		if (window.PlexReq.myplexUser) {
			this.$.loginButton.setShowing(false);
			this.$.myplexLoginItem.setShowing(true);
			this.$.myplexLoginItem.createComponent({name: "loggedInButton", 
																content: $L("Logged in as ") + window.PlexReq.myplexUser.username + " (" +window.PlexReq.myplexUser.email + ")"});
		}
		else {
			this.$.myplexLoginItem.setShowing(false);
			//this.$.myplexLoginItem.$.loggedInButton.destroy();
			this.$.loginButton.setShowing(true);
		}

		//quality selector sanity check
		if (window.PlexReq.videoQuality >= 3 && window.PlexReq.videoQuality <= 11) {
			this.$.videoQuality.setValue(window.PlexReq.videoQuality);	
		}
		else {
			this.$.videoQuality.setValue(6);
		}
		
		this.render();
		
		this.$.serverList.render();; //force-refresh local server list
		this.$.myPlexServerList.render(); //force-refresh myplex server list
		
	},
	showAddServerForm: function(inSender) {
		this.$.pane.selectViewByName("serverForm");
		this.$.serverForm.setServer(undefined);
		this.$.serverForm.setShowing(true);
	},
	showMyPlexForm: function(inSender) {
		this.$.pane.selectViewByName("myPlexForm");
		this.$.myPlexForm.setMyPlexDetails(undefined);
		this.$.myPlexForm.setShowing(true);
	},

	// new local servers
	newServerAdded: function(inSender, inServer) {
		window.PlexReq.servers.push(inServer);
		window.PlexReq.savePrefs();
		this.$.pane.back();
		
		this.reloadPrefs(); //force refresh of settings
	},
	serverRemoved: function(inSender, inServerIndex) {
		window.PlexReq.servers.remove(inServerIndex);
		window.PlexReq.savePrefs();
		this.$.pane.back();
		
		window.PlexReq.reloadPrefs(); //force refresh of settings
	},
	//myplex
	loggedInToMyPlex: function(inSender, myPlexUserData) {
		if (myPlexUserData !== undefined) {
			window.PlexReq.myplexUser = myPlexUserData;
			window.PlexReq.savePrefs();
			window.PlexReq.myPlexSections(); //force-refresh myplex servers (via sections)
		}
		this.reloadPrefs();
		this.$.pane.back();
	},
	checkServerReachability: function() {
		this.log("checking servers");
		//plexReq is constantly watching the servers and updating their .online flag when reachability changes,
		//so we just need to refresh the list to show the current reachability status
		this.$.myPlexServerList.render();
	},
	logoutFromMyPlex: function(inSender, myPlexUserData) {
		if (myPlexUserData !== undefined) {
			//destroy any myplex login and servers and save
			delete window.PlexReq.myplexUser;
			window.PlexReq.myplexServers = [];
			window.PlexReq.savePrefs();

			//refresh list
			this.reloadPrefs();
		}
		this.$.pane.back();
	},
	gotMyPlexServers: function(pmc) {
		//don't need to do anything with in-param since the serverlist will read the servers from plexreq when asked to refresh
		this.$.myPlexServerList.render();
	},
	listMyPlexSetupRow: function(inSender, inIndex) {
		this.log("listar myplex servers");
		
    // check if the row is selected
		if (window.PlexReq.myplexServers !== undefined && inIndex < window.PlexReq.myplexServers.length) {
			var myplexServer = window.PlexReq.myplexServers[inIndex];
			var reachabilityStatus = myplexServer.online ? $L("online") : $L("offline");
			this.$.myPlexServerName.setLabel(myplexServer.name)
			this.$.onlineStatus.setContent(reachabilityStatus);
			if (!myplexServer.online) {
				this.$.item.setDisabled(true);
			}
			return true;
		}
	},
	myplexLoginItemTap: function(inSender, inEvent) {
		this.$.pane.selectViewByName("myPlexForm");
		this.$.myPlexForm.setMyPlexDetails(window.PlexReq.myplexUser);
	},
	backHandler: function(inSender) {
		this.$.pane.back();
	},
	listSetupRow: function(inSender, inIndex) {
		this.log("listar servers");
		
    // check if the row is selected
		if (window.PlexReq.servers !== undefined && inIndex < window.PlexReq.servers.length) {
			this.$.serverName.setContent(window.PlexReq.servers[inIndex].name);
			return true;
		}
	},
	listItemTap: function(inSender, inEvent) {
		selectedRow = inEvent.rowIndex;
		if (selectedRow < window.PlexReq.servers.length) {
			var server = window.PlexReq.servers[selectedRow];
			this.$.pane.selectViewByName("serverForm");
			this.$.serverForm.setServer(server);
			
		}
	},
	togglePreferenceClick: function(inSender, inState) {
	    this.log("Toggled to state" + inState + " for server:"+inSender);
	},
	videoQualityChanged: function(inSender, inValue, inOldValue) {
    if (inValue != inOldValue) {
    	window.PlexReq.videoQuality = inValue;
			window.PlexReq.savePrefs();
		}
	},
	
});
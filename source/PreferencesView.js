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
									{name: "onlineStatus", content: "", style: "color: green;", className: "enyo-label"},
								]}
							]}
						]},
						{content:$L("Use myPlex to access servers shared with you"), className: "prefs-body-text", style:"margin:none;"},
						
						//local PMSes
						/*
						{kind: "RowGroup", caption: $L("Server discovery"), components: [
							{kind: "LabeledContainer", caption: $L("Discover local network servers"), components: [
								{kind: "ToggleButton", name: "rememberPasswords", style: "padding: 0px;", onChange: "toggleAutoDiscovery", state: true},
							]},
						]},
						{content:$L("If enabled, Plex will try to auto-discover servers on your network"), className: "prefs-body-text", style:"margin:none;"},
						*/
						{kind: "RowGroup", caption: $L("Servers on your network"), style: "margin-bottom: 10px", components: [
							{name: "serverList", kind:enyo.VirtualRepeater, style: "margin: -10px;", onSetupRow: "listSetupRow",components: [
								{kind: enyo.Item, name: "localItem", onclick: "listItemTap", tapHighlight: true, className: "server-list-item",layoutKind: "HFlexLayout", components: [
									{kind: "LabeledContainer", flex: 1, name: "serverName",label: "Server nr 1"},
									{name: "localOnlineStatus", content: "", style: "color: green;", className: "enyo-label"},
								]},
							]},
							{kind: enyo.Item, className: "server-list-item", layoutKind: "HFlexLayout", components: [
								{content: $L("Add new network server ..."), onclick: "showAddServerForm"},
							]},
						]},
						/*{kind: "Button", caption: $L("Add new network server ..."), onclick: "showAddServerForm"},	*/
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
					
						{kind: "RowGroup", caption: $L("Audio boost"), components: [
							{kind: "ListSelector", name: "audioBoostLevel", value: 1, onChange: "audioBoostChanged", items: [
								{caption: $L("No boost"), value: 100},
								{caption: $L("Small boost"), value: 170},
								{caption: $L("Big boost"), value: 230},
								{caption: $L("Huge boost"), value: 300},
							]}
						]},
						{content:$L('Tells the Plex server to provide even higher audio volume then the original video provides.'), className: "prefs-body-text", style:"margin-bottom:8px"},
						
						//direct-play
						{kind: "RowGroup", caption: $L("Direct Play"), components: [
							{kind: enyo.Item, layoutKind: "HFlexLayout", components: [
								{content: $L('Use Direct Play when possible?'), flex: 1, style: "margin-top: 5px"},
								{kind: "ToggleButton", name: "directPlayToggleButton", onLabel: $L('YES'), offLabel: $L('NO'), onChange: "toggleDirectPlay"},
							]}
						]},
						{content:$L('If turned on the client will try to play the file directly without using the transcoder.'), className: "prefs-body-text", style:"margin-bottom:8px"},
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
		window.PlexReq.loadPrefsFromCookie();
		this.reloadPrefs();
		this.$.pane.selectViewByName("mainPrefs");
		//refresher that watches the server list for reachability
		//window.PlexReq.setServersRefreshedCallback(enyo.bind(this,"gotServersUpdate"));
		this.serverUpdatedSub = pubsubz.subscribe('SERVER_UPDATED',enyo.bind(this,"gotServersUpdate"));
		this.serverAddedSub = pubsubz.subscribe('SERVER_ADDED',enyo.bind(this,"gotServersUpdate"));
	},
	reloadPrefs: function() {
		if (window.PlexReq.myplexUser) {
			this.$.loginButton.setShowing(false);
			this.$.myplexLoginItem.setShowing(true);
			this.$.myplexLoginItem.destroyControls();
			this.$.myplexLoginItem.createComponent({name: "loggedInButton", 
																content: $L("Logged in as ") + window.PlexReq.myplexUser.username + " (" +window.PlexReq.myplexUser.email + ")"});
		}
		else {
			this.$.myplexLoginItem.setShowing(false);
			//this.$.myplexLoginItem.$.loggedInButton.destroy();
			this.$.loginButton.setShowing(true);
		}

		if (window.PlexReq.servers.length > 0) {
			this.$.localItem.setShowing(true);
		}
		else {
			this.$.localItem.setShowing(false);
		}
		//quality selector sanity check
		if (window.PlexReq.videoQuality >= 3 && window.PlexReq.videoQuality <= 11) {
			this.$.videoQuality.setValue(window.PlexReq.videoQuality);	
		}
		else {
			this.$.videoQuality.setValue(6);
		}

		this.$.audioBoostLevel.setValue(window.PlexReq.audioBoost);
		this.$.directPlayToggleButton.setState(window.PlexReq.useDirectPlay);
		
		//this.render();
		//this.$.serverList.punt();
		//this.$.serverList.render();
		//this.$.serverList.render();; //force-refresh local server list
		//this.$.myPlexServerList.render(); //force-refresh myplex server list
		
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
	newServerAdded: function(inSender) {
		//this.reloadPrefs(); //force refresh of settings
		this.$.serverList.render();
		this.$.pane.back();
		
		
	},
	serverRemoved: function(inSender, inServerIndex) {
		//this.reloadPrefs(); //force refresh of settings
		this.$.serverList.render();
		this.$.pane.back();
	},
	//myplex
	loggedInToMyPlex: function(inSender, myPlexUserData) {
		if (myPlexUserData !== undefined) {
			window.PlexReq.myplexUser = myPlexUserData;
			window.PlexReq.savePrefs();
			window.PlexReq.myPlexSections(); //force-refresh myplex servers (via sections)
		}
		this.reloadPrefs();
		this.$.myPlexServerList.render(); //force-refresh myplex server list
		this.$.pane.back();
	},
	gotServersUpdate: function() {
		this.log("got servers updated event, refresing both myplex and local server list");
		//plexReq is constantly watching the servers and updating their .online flag when reachability changes,
		//so we just need to refresh the list to show the current reachability status
		//this.reloadPrefs();
		this.$.myPlexServerList.render();
		this.$.serverList.render();
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
				this.$.onlineStatus.setStyle("color: red;");
			}
			return true;
		}
	},
	listSetupRow: function(inSender, inIndex) {
		this.log("listar servers");
		
    // check if the row is selected
		if (window.PlexReq.servers !== undefined && inIndex < window.PlexReq.servers.length) {
			var localServer = window.PlexReq.servers[inIndex];
			var reachabilityStatus = localServer.online ? $L("online") : $L("offline");
			this.$.serverName.setLabel(localServer.name);
			this.$.localOnlineStatus.setContent(reachabilityStatus);
			if (!localServer.online) {
				this.$.localOnlineStatus.setStyle("color: red;");
				//this.$.localItem.setDisabled(true);
			}
			this.$.localItem.show();			
			return true;
		}
	},
	myplexLoginItemTap: function(inSender, inEvent) {
		this.$.pane.selectViewByName("myPlexForm");
		this.$.myPlexForm.setMyPlexDetails(window.PlexReq.myplexUser);
	},
	listItemTap: function(inSender, inEvent) {
		selectedRow = inEvent.rowIndex;
		if (selectedRow < window.PlexReq.servers.length) {
			var server = window.PlexReq.servers[selectedRow];
			this.$.pane.selectViewByName("serverForm");
			this.$.serverForm.setServer(server);
			
		}
	},
	backHandler: function(inSender) {
		window.PlexReq.loadPrefsFromCookie();
		this.$.pane.back();
	},
	videoQualityChanged: function(inSender, inValue, inOldValue) {
    if (inValue != inOldValue) {
    	window.PlexReq.videoQuality = inValue;
			window.PlexReq.savePrefs();
		}
	},
	toggleAutoDiscovery: function(inSender, inState) {
		this.log("Toggled auto-discovery to state: " + inState);
		window.PlexReq.useAutoDiscovery = inState;
		window.PlexReq.savePrefs();
	},
	audioBoostChanged: function(inSender, inValue, inOldValue) {
		this.log("audio boost: " + inValue);
    	if (inValue != inOldValue) {
    	window.PlexReq.audioBoost = inValue;
			window.PlexReq.savePrefs();
		}
	},
	toggleDirectPlay: function(inSender, inState) {
		this.log("Toggled direct-play to state: " + inState);
		window.PlexReq.useDirectPlay = inState;
		window.PlexReq.savePrefs();
	},
	destroy: function() {
		this.log("destroying prefs, removing subscribtions");
		pubsubz.unsubscribe(this.serverUpdatedSub);
		pubsubz.unsubscribe(this.serverAddedSub);
		//call inherited for GC marking
		this.inherited(arguments);
	},
	
});
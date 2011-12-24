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
			{name: "browserBonjour", kind: "PalmService", service: "palm://com.palm.zeroconf/", 
				method: "browse", subscribe: true, onSuccess: "gotBrowsed", onFailure: "genericFailure"},
			{name: "resolverBonjour", kind: "PalmService", service: "palm://com.palm.zeroconf/", 
					method: "resolve", subscribe: true, onSuccess: "gotResolved", onFailure: "genericFailure"},
			
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
								{kind: enyo.Item, className: "server-list-item", components: [
									{kind: "LabeledContainer", name: "myPlexServerName",label: "Server nr 1", components: [
									{kind: "ToggleButton", name: "myPlexIncludeServer", onLabel: $L("Show"), offLabel: $L("Hide"), onChange: "togglePreferenceClick", onclick: "togglePreferenceClick"}
									]},
								]}
							]}
						]},
						{content:$L("Use myPlex to access servers shared with you"), className: "prefs-body-text", style:"margin:none;"},
						
						//local PMSes
						{kind: "RowGroup", caption: $L("Servers on your network"), style: "margin-bottom: 10px", components: [
							{name: "serverList", kind:enyo.VirtualRepeater, style: "margin: -10px;", onSetupRow: "listSetupRow",components: [
								{kind: enyo.Item, onclick: "listItemTap", className: "server-list-item",layoutKind: "HFlexLayout", components: [
									{name: "serverName", label: "Server nr 1", flex: 1},
									{kind: "ToggleButton", name: "includeServer", onclick: "", onLabel: $L("Show"), offLabel: $L("Hide"), onChange: "togglePreferenceClick"},
								]},
							]},
							//{kind: enyo.Item, className: "server-list-item", layoutKind: "HFlexLayout", components: [
								{content: $L("Add new network server ..."), onclick: "showAddServerForm"},
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
							{kind: "ListSelector", name: "videoQuality", value: 1, onChange: "videoQualityChange", items: [
								{caption: $L("8 Mbps, 1080p"), value: 1},
								{caption: $L("4 Mbps, 720p"), value: 1},
								{caption: $L("3 Mbps, 720p"), value: 1},
								{caption: $L("2 Mbps, 720p"), value: 1},
								{caption: $L("1.5 Mbps, 480p"), value: 1},
								{caption: $L("720 kbps, 320p"), value: 1},
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
		this.plexReq = new PlexRequest();
		this.reloadPrefs();
		//this.$.browserBonjour.call({"regType":"_plexmediasvr._tcp", "domainName":"local."});
		this.$.pane.selectViewByName("mainPrefs");
	},
	reloadPrefs: function() {
		this.plexReq.loadPrefsFromCookie();
		if (this.plexReq.myplexUser) {
			this.$.loginButton.setShowing(false);
			this.$.myplexLoginItem.setShowing(true);
			this.$.myplexLoginItem.createComponent({name: "loggedInButton", 
																content: $L("Logged in as ") + this.plexReq.myplexUser.username + " (" +this.plexReq.myplexUser.email + ")"});
			this.refreshMyPlexServers();
		}
		else {
			this.$.myplexLoginItem.setShowing(false);
			//this.$.myplexLoginItem.$.loggedInButton.destroy();
			this.$.loginButton.setShowing(true);
		}

		//if (this.plexReq.servers.length > 0){
			this.$.serverList.render();; //force-refresh local server list
		//}

		//if (this.plexReq.myplexServers.length > 0){
			this.$.myPlexServerList.render(); //force-refresh myplex server list
		//}
	},
	gotBrowsed: function(inSender, inResponse) {
	  if (inResponse.returnValue) {
	    //just a msg that it went well, skip it
	    return;
	  }
		this.$.console.addContent("BROWSE> " + JSON.stringify(inResponse.instanceName) + "<br/>");

    //we've found something, let's resolve this to get some details about the machine
		this.$.resolverBonjour.call({"regType":inResponse.regType, "domainName":inResponse.domainName,
		                            "instanceName":inResponse.instanceName, "subscribe": true});
	},
	gotResolved: function(inSender, inResponse) {
  	if (inResponse.returnValue) {
	    //just a msg that it went well, skip it
  	  return;
  	}
	
		this.$.console.addContent("RESOLVE>: " + JSON.stringify(inResponse.targetName)+ "<br/>");

    //add found server to server list
    var serverName = inResponse.targetName;
    var serverUrl = "http://" + inResponse.IPv4Address; //no http included when found via bonjour
    
    var foundServer = {
	    				name:serverName,
    		  		host:serverUrl, 
    		  		port:32400, //always 32400
    		  		user:undefined,
    		  		pass:undefined,
    		  		include:true,
    		  		owned:"1",
    		  		accessToken:undefined};
    
    var existingServer = this.plexReq.serverForUrl(serverUrl);
    if (!existingServer) {
      this.plexReq.servers.push(foundServer);
      this.plexReq.savePrefs();
      this.$.serverList.render();; //force-refresh list
    }
	},
	genericFailure: function(inSender, inResponse) {
		this.log("failure: " + JSON.stringify(inResponse));
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
		this.plexReq.servers.push(inServer);
		this.plexReq.savePrefs();
		this.$.pane.back();
		
		this.reloadPrefs(); //force refresh of settings
	},
	serverRemoved: function(inSender, inServerIndex) {
		this.plexReq.servers.remove(inServerIndex);
		this.plexReq.savePrefs();
		this.$.pane.back();
		
		this.plexReq.reloadPrefs(); //force refresh of settings
	},
	//myplex
	loggedInToMyPlex: function(inSender, myPlexUserData) {
		if (myPlexUserData !== undefined) {
			this.plexReq.myplexUser = myPlexUserData;
			this.plexReq.savePrefs();		
		}
		this.reloadPrefs();
		this.$.pane.back();
	},
	refreshMyPlexServers: function() {
		this.plexReq = new PlexRequest(enyo.bind(this,"gotMyPlexServers"));
		this.plexReq.getMyPlexServers();	
	},
	logoutFromMyPlex: function(inSender, myPlexUserData) {
		if (myPlexUserData !== undefined) {
			//destroy any myplex login and servers and save
			delete this.plexReq.myplexUser;
			this.plexReq.myplexServers = [];
			this.plexReq.savePrefs();

			//refresh list
			this.reloadPrefs();
		}
		this.$.pane.back();
	},
	gotMyPlexServers: function(pmc) {
		if (pmc !== undefined) {
			for (var i = 0; i < pmc.Server.length; i++) {
				var server = pmc.Server[i];
				var foundServer = {
							machineIdentifier:server.machineIdentifier,
							name:server.name,
    		  		host:server.host, 
    		  		port:server.port, //always 32400
    		  		user:null,
    		  		pass:null,
    		  		include:true,
    		  		owned:server.owned,
    		  		accessToken:server.accessToken};
		    var existingServer = this.plexReq.getMyPlexServerWithMachineId(server.machineIdentifier);
		    if (!existingServer) {
		      this.plexReq.myplexServers.push(foundServer);
				}
			}
		}
		this.$.myPlexServerList.render();
	},
	listMyPlexSetupRow: function(inSender, inIndex) {
		this.log("listar myplex servers");
		
    // check if the row is selected
		if (this.plexReq.myplexServers !== undefined && inIndex < this.plexReq.myplexServers.length) {
			this.$.myPlexServerName.setLabel(this.plexReq.myplexServers[inIndex].name);
			this.$.myPlexIncludeServer.setState(this.plexReq.myplexServers[inIndex].include);
			return true;
		}
	},
	myplexLoginItemTap: function(inSender, inEvent) {
		this.$.pane.selectViewByName("myPlexForm");
		this.$.myPlexForm.setMyPlexDetails(this.plexReq.myplexUser);
	},
	backHandler: function(inSender) {
		this.$.pane.back();
	},
	listSetupRow: function(inSender, inIndex) {
		this.log("listar servers");
		
    // check if the row is selected
		if (this.plexReq.servers !== undefined && inIndex < this.plexReq.servers.length) {
			this.$.serverName.setContent(this.plexReq.servers[inIndex].name);
			this.$.includeServer.setState(this.plexReq.servers[inIndex].include)
			return true;
		}
	},
	listItemTap: function(inSender, inEvent) {
		selectedRow = inEvent.rowIndex;
		if (selectedRow < this.plexReq.servers.length) {
			var server = this.plexReq.servers[selectedRow];
			this.$.pane.selectViewByName("serverForm");
			this.$.serverForm.setServer(server);
			
		}
	},
	togglePreferenceClick: function(inSender, inState) {
	    this.log("Toggled to state" + inState + " for server:"+inSender);
	},
	
});
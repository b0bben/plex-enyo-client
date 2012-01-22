enyo.kind({
	name: "plex.ServerFormView",
	kind: "enyo.VFlexBox",
  className: "basic-back",
	events: {
      onDelete: "",
      onSave: "",
      onCancel: ""
	},
	published: {
		server: undefined,
	},
	components: [
		{kind:"Toolbar", className:"enyo-toolbar-light", pack:"center", components: [
			{kind: "Image", name:"titleIcon"},
	        {kind: "Control", content: $L("Add Plex Media Server")}
		]},
		{className:"accounts-header-shadow"},
		{kind: "Scroller", flex: 1, components: [
			{kind: "Control", className:"enyo-preferences-box", components: [
				{kind: "plex.ServerForm", name: "form", onSave: "saveServer", onDelete: "deleteServer"},
			]}
		]},
		{className:"accounts-footer-shadow"},
		{kind:"Toolbar", className:"enyo-toolbar-light", components:[
			{kind: "Button", label: $L("Cancel"), className:"accounts-toolbar-btn", onclick: "doCancel"}
		]},
	],
	create: function() {
		this.inherited(arguments);
		this.serverChanged();
	},
	saveServer: function(inSender) {
		this.doSave();
	},
	deleteServer: function(inSender) {
		this.doDelete();
	},
	serverChanged: function() {
		this.$.form.setServer(this.server);
	}
});

enyo.kind({
	name: "plex.ServerForm",
	kind: enyo.Control,
	events: {
      onDelete: "",
      onSave: "",
      onCancel: ""
	},
	published: {
		server: undefined,
	},
	components: [
		{name: "nameTitle", caption:$L("Server nickname"), kind: "RowGroup", components: [
			{kind: "Input", name: "servername", hint: $L("Give this server a friendly name"), spellcheck: false, autocorrect:false},
		]},
		
		{name: "serverTitle", caption:"Server location", kind: "RowGroup", components: [
			{kind: "Input", name: "serverurl", hint: $L("Type your servers IP address"), spellcheck: false, autocorrect:false, autoCapitalize: "lowercase", inputType:"url"},
		]},
		{content:$L('IP address to your Plex Media Server, like this: 192.168.1.100'), className: "prefs-body-text", style:"margin-bottom:8px"},
		
		{name: "loginTitle", caption: "Login details", kind: "RowGroup", components: [
			{kind: "Input", name: "username", hint: $L("Type your username"), autocorrect: false, spellcheck: false, changeOnInput: true, onchange: "keyTapped", onkeydown:"checkForEnter"},
			{kind: "PasswordInput", name: "password", hint: $L("Type your password"),changeOnInput: true, onchange: "keyTapped", onkeydown:"checkForEnter"}
		]},
		{content:$L('Login details are only needed when the server is outside your network.'), className: "prefs-body-text", style:"margin-bottom:8px"},
		
		{name: "errorBox", kind: "enyo.HFlexBox", className:"error-box", align:"center", showing:false, components: [
			{name: "errorImage", kind: "Image", src: "images/header-warning-icon.png"},
			{name: "errorMessage", className: "enyo-text-error", flex:1}
		]},
		{name:"addServerButton", kind: "ActivityButton", caption: $L("Add server"),className:"enyo-button-affirmative accounts-btn", onclick: "addServerTapped"},
		{name:"removeServerButton", kind: "ActivityButton", caption: $L("Remove this server"), active: false, className:"enyo-button-negative accounts-btn", onclick: "removeServerTapped"},
		{ name: "serverFailureDialog", kind: "MessageDialog", message: $L("Could not reach this server. Make sure it's online before adding it.") }	
	],
	create: function() {
		this.inherited(arguments);
		this.serverDetails = "";
		this.serverChanged();
	},
	serverChanged: function() {
		if (this.server !== undefined) {
			var ui = this.$;
			ui.servername.setValue(this.server.name);
			ui.serverurl.setValue(this.server.host);
			
			if (this.server.username !== undefined) {
				ui.username.setValue(this.server.username);
				ui.password.setValue(this.server.password);
			}
			
      this.$.addServerButton.setCaption($L("Update server"));			
			this.$.removeServerButton.setDisabled(false);
		} else {
			var ui = this.$;
			ui.servername.setValue("");
			ui.serverurl.setValue("");
			ui.username.setValue("");
			ui.password.setValue("");

			this.$.removeServerButton.setDisabled(true);
		}
		
	},
	addServerTapped: function(inSender, inEvent) {
	    this.$.addServerButton.setActive(true);
      this.$.addServerButton.setDisabled(true);
      var serverName = this.$.servername.getValue();
      var serverUrl = this.$.serverurl.getValue();
      var username = this.$.username.getValue();
      var password = this.$.password.getValue();

      var existingServer = window.PlexReq.serverForUrl(serverUrl);
      if (!existingServer) {
	    	var addedServer = new PlexServer(undefined,
		    				serverName,
	    		  		serverUrl,
	    		  		32400, //always 32400 for local servers
	    		  		undefined,
	    		  		undefined,
	    		  		true,
	    		  		"1",
	    		  		undefined,
	    		  		"1");

	    	addedServer.collectMoreInfo(); //we need machineIdentifier and other cool stuff, so collect that by reaching out to the server
        if (addedServer.machineIdentifier) {
        	window.PlexReq.addServer(addedServer);
        	window.PlexReq.savePrefs();
        	this.$.addServerButton.setActive(false);
      		this.$.addServerButton.setDisabled(false);
        	
        	this.doSave();
        }
        else
        	this.$.serverFailureDialog.openAtCenter();
        	this.$.addServerButton.setActive(false);
      		this.$.addServerButton.setDisabled(false);
      } else {  
	      //this server is already in list
	      this.doSave();
    }
	},
	removeServerTapped: function(inSender, inEvent) {
		if (this.server && this.server.machineIdentifier) {
			window.PlexReq.removeServerWithMachineId(this.server.machineIdentifier);
			this.doDelete();
		}
		else if (this.server && this.server.host) {
			//something weird has happened, we don't have a machine ID
			window.PlexReq.removeServerWithHost(this.server.host);
			this.doDelete();

		}
	},
	gotNothing: function() {
	//placeholder
	},
});

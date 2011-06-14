enyo.kind({
	name: "plex.ServerFormView",
	kind: "enyo.VFlexBox",
  className: "basic-back",
	events: {
      onReceive: "",
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
				{kind: "plex.ServerForm", name: "form", onSave: "saveForm"},
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
	saveForm: function(inSender, inServerDetails) {
		this.doSave(inServerDetails);
	},
	serverChanged: function() {
		this.$.form.setServer(this.server);
	}
});

enyo.kind({
	name: "plex.ServerForm",
	kind: enyo.Control,
	events: {
      onReceive: "",
      onSave: "",
      onCancel: ""
	},
	published: {
		server: undefined,
	},
	components: [
		{name: "nameTitle", caption:$L("Server nickname"), kind: "RowGroup", components: [
			{kind: "Input", name: "servername", hint: $L("Server nickname"), spellcheck: false, autocorrect:false},
		]},
		
		{name: "serverTitle", caption:"Server details", kind: "RowGroup", components: [
			{kind: "Input", name: "serverurl", hint: $L("Server URL address"), spellcheck: false, autocorrect:false, autoCapitalize: "lowercase", inputType:"url"},
			{kind: "Input", name: "serverport", value: "32400", spellcheck: false, autocorrect:false, autoCapitalize: "lowercase"}
		]},
		{name: "loginTitle", caption: "Login details", kind: "RowGroup", components: [
			{kind: "Input", name: "username", hint: $L("Type your username"), changeOnInput: true, onchange: "keyTapped", onkeydown:"checkForEnter"},
			{kind: "PasswordInput", name: "password", hint: $L("Type your password"),changeOnInput: true, onchange: "keyTapped", onkeydown:"checkForEnter"}
		]},
		{name: "errorBox", kind: "enyo.HFlexBox", className:"error-box", align:"center", showing:false, components: [
			{name: "errorImage", kind: "Image", src: "images/header-warning-icon.png"},
			{name: "errorMessage", className: "enyo-text-error", flex:1}
		]},
		{name:"addServerButton", kind: "ActivityButton", caption: $L("Add server"),className:"enyo-button-affirmative accounts-btn", onclick: "addServerTapped"},
		{name:"removeServerButton", kind: "ActivityButton", caption: $L("Remove this server"), active: false, disabled: true, className:"enyo-button-negative accounts-btn", onAccountsRemove_Removing: "removingAccount", onAccountsRemove_Done: "doCredentials_Cancel"},
			
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
			ui.serverport.setValue(this.server.port);
			
			if (this.server.username !== undefined) {
				ui.username.setValue(this.server.username);
				ui.password.setValue(this.server.password);
			}
			
			removeServerButton.setActive(true);
		}
	},
	addServerTapped: function(inSender, inEvent) {
      var serverName = this.$.servername.getValue();
      var serverUrl = this.$.serverurl.getValue();
      var serverPort = this.$.serverport.getValue();
      var username = this.$.username.getValue();
      var password = this.$.password.getValue();
      
      this.serverDetails = {name:serverName,
					  		host:serverUrl,
					  		port:serverPort,
					  		user:username,
					  		pass:password,
					  		include: true};
  		
			enyo.setCookie("newPMSServer", enyo.json.stringify(this.serverDetails));
			this.log("cookie for new server set: " + enyo.json.stringify(this.serverDetails));
			this.doSave(this.serverDetails);
  },
});
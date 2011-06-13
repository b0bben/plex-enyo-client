enyo.kind({
	name: "plex.ServerFormView",
	kind: "enyo.VFlexBox",
  className: "basic-back",
	events: {
      onReceive: "",
      onSave: "",
      onCancel: ""
	},
	components: [
		{kind:"Toolbar", className:"enyo-toolbar-light", pack:"center", components: [
			{kind: "Image", name:"titleIcon"},
	        {kind: "Control", content: $L("Add Plex Media Server")}
		]},
		{className:"accounts-header-shadow"},
		{kind: "Scroller", flex: 1, components: [
			{kind: "Control", className:"enyo-preferences-box", components: [
				{kind: "plex.ServerForm", name: "form", onSave: "doSave", onCancel: "doCancel"},
			]}
		]},
		{className:"accounts-footer-shadow"},
		{kind:"Toolbar", className:"enyo-toolbar-light", components:[
			{kind: "Button", label: $L("Cancel"), className:"accounts-toolbar-btn", onclick: "doCredentials_Cancel"}
		]},
	],
	create: function() {
		this.inherited(arguments);
	},
});

enyo.kind({
	name: "plex.ServerForm",
	kind: enyo.Control,
	events: {
      onReceive: "",
      onSave: "",
      onCancel: ""
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
		{name:"signInButton", kind: "ActivityButton", caption: $L("Add server"),className:"enyo-button-affirmative accounts-btn", onclick: "addServerTapped"},
		{name:"removeAccountButton", kind: "ActivityButton", caption: $L("Remove this server") ,className:"enyo-button-negative accounts-btn", onAccountsRemove_Removing: "removingAccount", onAccountsRemove_Done: "doCredentials_Cancel"},
			
	],
	create: function() {
		this.inherited(arguments);
		this.serverDetails = "";
	},
	addServerTapped: function(inSender, inEvent) {
      var serverName = this.$.servername.getValue();
      var serverUrl = this.$.serverurl.getValue();
      var serverPort = this.$.serverport.getValue();
      var username = this.$.username.getValue();
      var password = this.$.password.getValue();
      
      this.serverDetails = {name:serverName,
      											url:serverUrl,
      											port:serverPort,
      											user:username,
      											pass:password};
      											
			enyo.setCookie("newPMSServer", enyo.json.stringify(this.serverDetails));
			this.log("cookie for new server set: " + enyo.json.stringify(this.serverDetails));
			this.doSave(this.serverDetails);
  },
});
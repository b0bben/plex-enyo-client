enyo.kind({
  name: "plex.MyPlexFormView",
  kind: "enyo.VFlexBox",
  className: "basic-back",
  events: {
      onLoggedOut: "",
      onLoggedIn: "",
      onCancel: ""
  },
  published: {
    myPlexDetails: undefined,
  },
  components: [
    {kind:"Toolbar", className:"enyo-toolbar-light", pack:"center", components: [
      {kind: "Image", name:"titleIcon"},
          {kind: "Control", content: $L("Connect to myPlex")}
    ]},
    {className:"accounts-header-shadow"},
    {kind: "Scroller", flex: 1, components: [
      {kind: "Image", src: "images/MyPlexLarge.png", style: "padding: 20px; width: 256px;height:256px;display: block; margin-left: auto;margin-right: auto"},
      {kind: "Control", className:"enyo-preferences-box", components: [
        {name: "loginTitle", caption: "Login details", kind: "RowGroup", components: [
          {kind: "Input", name: "username", hint: $L("Type your username"), autocorrect: false, spellcheck: false, changeOnInput: true, onchange: "keyTapped", onkeydown:"checkForEnter"},
          {kind: "PasswordInput", name: "password", hint: $L("Type your password"),changeOnInput: true, onchange: "keyTapped", onkeydown:"checkForEnter"}
        ]},
        {content:$L('Type your myPlex username (or your email address) and your password'), className: "prefs-body-text", style:"margin-bottom:8px"},
        
        {name: "errorBox", kind: "enyo.HFlexBox", className:"error-box", align:"center", showing:false, components: [
          {name: "errorImage", kind: "Image", src: "images/header-warning-icon.png"},
          {name: "errorMessage", className: "enyo-text-error", flex:1}
        ]},
        {name:"loginButton", kind: "ActivityButton", caption: $L("Login to myPlex"),className:"enyo-button-affirmative accounts-btn", onclick: "loginTapped"},
        {name:"logoutButton", kind: "ActivityButton", caption: $L("Logout"), active: false, className:"enyo-button-negative accounts-btn", onclick: "logoutTapped"},          
      ]}
    ]},
    {className:"accounts-footer-shadow"},
    {kind:"Toolbar", className:"enyo-toolbar-light", components:[
      {kind: "Button", label: $L("Cancel"), className:"accounts-toolbar-btn", onclick: "doCancel"}
    ]},
  ],
  create: function() {
    this.inherited(arguments);
    this.myPlexDetailsChanged();
    this.plexReq = new PlexRequest();
  },
  myPlexDetailsChanged: function() {
    if (this.myPlexDetails !== undefined) {
      ui.username.setValue(this.server.username);
      ui.password.setValue(this.server.password);
      
      this.$.loginButton.setDisabled(true);
      this.$.logoutButton.setDisabled(false);
    } else {
      var ui = this.$;
      ui.username.setValue("");
      ui.password.setValue("");
      this.$.loginButton.setDisabled(false);
      this.$.logoutButton.setDisabled(true);
    }
  },
  loginTapped: function(inSender, inEvent) {
      var username = this.$.username.getValue();
      var password = this.$.password.getValue();
      
      if (username !== undefined && password !== undefined) {
        this.plexReq = new PlexRequest(enyo.bind(this,"myPlexLoginResponse"));
        this.$.loginButton.setActive(true);
        this.$.loginButton.setDisabled(true);
        //send request to myplex async
        this.plexReq.loginToMyPlex(username,password);
      }
      else {}
        //TODO: error handling
  },
  logoutTapped: function(inSender, inEvent) {
    var prefCookie = enyo.getCookie("prefs");
    
    if (prefCookie !== undefined) {
      var serverList = enyo.json.parse(prefCookie);
      for (var i = serverList.length - 1; i >= 0; i--){
        var serverAsJson = serverList[i];
        if (serverAsJson.name == this.server.name && serverAsJson.host == this.server.host && serverAsJson.port == this.server.port){
          this.doDelete(i);
        } 
      };
    }
  },
  myPlexLoginResponse: function(userData) {
    console.log("myPlexLoginResponse: "+userData.user["authentication-token"]);
    this.$.loginButton.setActive(false);
    this.$.loginButton.setDisabled(true);
    this.$.logoutButton.setDisabled(false);

    this.doLoggedIn(userData.user);
  },
});
enyo.kind({
  name: "plex.MyPlexSectionsView",
  kind: "VFlexBox",
  className: "enyo-bg",
  published: {
    headerContent: "",
    parentMediaContainer: undefined,
  },
  events: {
    onSelectedSection: ""
  },
  components: [
    {name: "header", kind: "Header",style: '-webkit-box-align: center !important;',pack: 'center', className: "enyo-header-dark", components: [
      {kind: "Image", src: "images/PlexTextLogo.png", style: "padding: 0px !important;"}
    ]},
    {kind: enyo.Scroller, flex: 1, components: [
      {name: "serverList",kind: "VirtualRepeater",flex: 1, height: "100%", onSetupRow: "setupServerItems", components: [
         {name: "cells", kind: "VFlexBox"}
      ]},
    ]},
        
    {kind: "Selection"},
    /*{kind: "Button", onclick: "openAppMenu", caption: "appmenu"},*/
  ],
  create: function() {
    this.inherited(arguments);
    this.listedServers = [];
    this.sections = [];
    this.headerContentChanged();
    this.$.cells.destroyControls();
    //this.parentMediaContainerChanged();
    this.objCurrNavItem = "";
    this.selectedRow = -1;
  },
  headerContentChanged: function() {
    //this.$.header.setContent(this.headerContent);
  },
  parentMediaContainerChanged: function() {
    this.sortUniqueServers();
    this.render();
    //this.$.cells.destroyControls();
    //this.$.serverList.render();
  },
  sortUniqueServers: function() {
    if (this.parentMediaContainer !== undefined) {
      for (var i = 0; i < this.parentMediaContainer.size; i++) {
        var serverAndSection = this.parentMediaContainer.Directory[i];
        var newServer = { serverName: serverAndSection.serverName,
                          machineIdentifier: serverAndSection.machineIdentifier,
                          sections: [serverAndSection]};
        
        this.addOrInsertNewServer(newServer);
            
      }
    }
  },
  addOrInsertNewServer: function(newServer) {
    if (this.listedServers.length == 0) {
      this.listedServers.push(newServer);
      return;
    }
    for (var i = 0; i < this.listedServers.length; i++) {
      if (this.listedServers[i].machineIdentifier == newServer.machineIdentifier) {
        //for (var j = 0; j < newServer.sections.length; j++) {
          this.listedServers[i].sections.push(newServer.sections[0]);
          return;
        //};
        
      }
    };
    this.listedServers.push(newServer);
    return;
  },
  setupServerItems: function(inSender, inIndex) {
    if (this.listedServers.length == 0) {
      return false;
    }      
    var myPlexServer = this.listedServers[inIndex];
    if (myPlexServer !== undefined) {
      this.log("creating myplex section " + myPlexServer.serverName);
      this.$.cells.createComponents([{kind: "plex.MyPlexSection", onRowSelected: "sectionRowSelected", 
                                    sharedServer: myPlexServer, 
                                    caption: myPlexServer.serverName, 
                                    owner: this}]);
      this.log("created");
      return true;
    }
    return false;
  },
  sectionRowSelected: function(inSender, inSection, inServer) {
    this.log("section selected: " + inServer.name + "->" + inSection.title);
    var pmo = {"server": inServer, "section": inSection};
    this.doSelectedSection(pmo);
  },
  openAppMenu: function() {
      this.owner.$.appMenu.open();
  },
 });

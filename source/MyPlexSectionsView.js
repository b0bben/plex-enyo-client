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
        {name: "cells", kind: "VFlexBox"},
      ]},
    ]},    
    {kind: "Selection"},
    {kind: "Button", onclick: "openAppMenu", caption: "appmenu"},
  ],
  create: function() {
    this.inherited(arguments);
    this.sectionsUi = [];
    this.headerContentChanged();
    //this.parentMediaContainerChanged();
    this.objCurrNavItem = "";
    this.selectedRow = -1;
    this.log("created MyPlexSectionView");
    //this.$.cells.destroyControls();
    //this.$.serverList.render();
    
  },
  headerContentChanged: function() {
    //this.$.cells.destroyControls();
    //this.$.serverList.render();
  },
  parentMediaContainerChanged: function() {
    this.buildSections()
  },
  buildSections: function() {
    for (var i = 0; i < this.parentMediaContainer.length; i++) {
      var myplexServer = this.parentMediaContainer[i];
      var c = {kind: "plex.MyPlexSection", onRowSelected: "sectionRowSelected", sections: myplexServer.sections, caption: myplexServer.serverName, owner:this};
      this.sectionsUi.push(c);
    };    
    this.$.cells.destroyControls();
    this.$.serverList.render();
  },
  setupServerItems: function(inSender, inIndex) {
    //this.$.cells.destroyControls(); //needs to be done, or we'll get each server each time
    if (this.parentMediaContainer === undefined || this.parentMediaContainer.length == 0) {
      return false;
    }      
    
    if (!this.created) {
      this.$.cells.createComponents(this.sectionsUi);  
      this.log("created myplex sections");
      this.created = true;
      return true;
    }
  },
  sectionRowSelected: function(inSender, inSection, inServer) {
    //deal with selection across multiple instances of MyPlexSection
    var ctrls = this.$.cells.getControls();
    for (var i = 0; i < ctrls.length; i++) {
      var ctrl = ctrls[i];
      if (ctrl != inSender) {
        ctrl.selectedRow = -1;
        ctrl.render();
      }
    };
    this.log("section selected: " + inServer.name + "->" + inSection.title);
    var pmo = {"server": inServer, "section": inSection};
    this.doSelectedSection(pmo);
  },
  openAppMenu: function() {
      this.owner.$.appMenu.open();
  },
 });

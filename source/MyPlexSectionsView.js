enyo.kind({
  name: "plex.MyPlexSectionsView",
  kind: "VFlexBox",
  className: "enyo-bg",
  published: {
    headerContent: "",
    localMediaContainer: undefined,
    myplexMediaContainer: undefined,
  },
  events: {
    onSelectedSection: ""
  },
  components: [
      {name: "serverList",kind: "VirtualRepeater",flex: 1, height: "100%", onSetupRow: "setupServerItems", components: [
        {name: "cells", kind: "VFlexBox"},
      ]},
    {kind: "Selection"},
  ],
  create: function() {
    this.inherited(arguments);
    this.sectionsUi = [];
    this.headerContentChanged();
    //this.parentMediaContainerChanged();
    this.objCurrNavItem = "";
    this.selectedRow = -1;
    this.log("created MyPlexSectionView");
    this.$.cells.destroyControls();
    this.$.serverList.render();
    
  },
  headerContentChanged: function() {
    //this.$.cells.destroyControls();
    //this.$.serverList.render();
  },
  localMediaContainerChanged: function() {
    this.isLocal = true;
    this.created = false;
    this.sectionsUi = [];
    this.buildSections();
  },
  myplexMediaContainerChanged: function() {
    this.isMyPlex = true;
    this.created = false;
    this.sectionsUi = [];
    this.buildSections();
  },
  buildSections: function() {
    if (this.isLocal){
      this.pmc = this.localMediaContainer;
      this.libraryTitle = $L("Local library");
    }
    else if (this.isMyPlex) {
      this.pmc = this.myplexMediaContainer;
      this.libraryTitle = $L("Shared library");
    }
    //for (var i = 0; i < this.pmc.size; i++) {
    //  var myplexServer = this.pmc.Directory[i];
      var c = {kind: "plex.MyPlexSection", onRowSelected: "sectionRowSelected", sections: this.pmc, caption: this.libraryTitle, owner:this};
      this.sectionsUi.push(c);
    //};    
    this.$.cells.destroyControls();
    this.$.serverList.render();
  },
  setupServerItems: function(inSender, inIndex) {
    //this.$.cells.destroyControls(); //needs to be done, or we'll get each server each time
    if (this.pmc === undefined || this.pmc.length == 0) {
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

enyo.kind({ 
  name: "plex.MyPlexSection",
  kind: enyo.DividerDrawer,
  captionClassName: 'library-navigation-item library-navigation-section-divider',
  published: {
    sharedServer: undefined,
    showCaption: false,
  },
  events: {
    onRowSelected: "",
  },
  components: [
    {name: "sectionList", kind: "VirtualRepeater",flex: 1, className: "section-list",onSetupRow: "setupSectionRowItems", components: [
    {name: "sectionItem", kind: enyo.Item, layoutKind: "VFlexLayout", style: "border-top:none;",onclick: "sectionRowSelected",Xonmousedown: "sectionRowSelected", components: [
    {name: "sectionButton", kind: "plex.ButtonMenu"},
  ]},
  ]},       
  ],
  create: function() {
    this.inherited(arguments);
    this.selectedRow = -1;
    this.sections = [];
    this.sharedServerChanged();
    this.showCaptionChanged();
  },
  sharedServerChanged: function() {
    if (this.sharedServer !== undefined) {
      this.log("creating myplex sharedServer " + this.sharedServer.serverName);
      this.$.sectionList.render();
    }
  },
  showCaptionChanged: function() {
    
  },
  setupSectionRowItems: function(inSender, inIndex) {
    // check if the row is selected
    // color the row if it is
    this.$.sectionItem.addRemoveClass("active", (inIndex == this.selectedRow));
    var section = this.sharedServer.sections[inIndex];
    if (section) {          
      this.$.sectionButton.setHeaderContent(section);
      
      //this.log("ritar sektion: " + section.title);
      return true;
    }

    return false;
  },
  sectionRowSelected: function(inSender, inEvent) {
    this.selectedRow = inEvent.rowIndex;
    var sectionAndServer = this.sharedServer.sections[this.selectedRow];
    var myPlexServer = new PlexServer(sectionAndServer.machineIdentifier,
                                      sectionAndServer.serverName,
                                      sectionAndServer.host, 
                                      sectionAndServer.port,
                                      null,
                                      null,
                                      true,
                                      sectionAndServer.owned,
                                      sectionAndServer.accessToken);
    //send both the server and the section that was chosen upstreams, this will eventually end up in the grid
    this.doRowSelected(this.sharedServer.sections[this.selectedRow], myPlexServer);
    this.$.sectionList.render();
  }
});
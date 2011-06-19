enyo.kind({	
	name: "plex.ServerSection",
	kind: enyo.DividerDrawer,
	published: {
		mediaServer: undefined,
		showCaption: false,
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
		this.mediaServerChanged();
		this.showCaptionChanged();
	},
	mediaServerChanged: function() {
		if (this.mediaServer !== undefined) {
			for (var j = this.mediaServer.pmo.MediaContainer.Directory.length - 1; j >= 0; j--){
				var r = this.mediaServer.pmo.MediaContainer.Directory[j];
				this.sections.push(r);
			};
			this.$.sectionList.render();
		}
	},
	showCaptionChanged: function() {
		
	},
	setupSectionRowItems: function(inSender, inIndex) {
	    // check if the row is selected
	    // color the row if it is
    	this.$.sectionItem.addRemoveClass("active", (inIndex == this.selectedRow));
		var section = this.sections[inIndex];
      	if (section) {        	
			this.$.sectionButton.setHeaderContent(section);
				
			this.log("ritar sektion: " + section.title);
			return true;
		}

		return false;
	},
	sectionRowSelected: function(inSender, inEvent) {
    	this.selectedRow = inEvent.rowIndex;
    	//this.$.sectionList.render();
    
    	this.log("The user clicked on item number: " + inEvent.rowIndex);
    	this.log("sender: " + inSender + ", parent: " + inSender.owner.owner);
    	var mainView = inSender.owner.owner;
    	mainView.showGridView(this.listedSections[this.selectedRow]);
    
   		//this.$.sectionList.render();
  },
});
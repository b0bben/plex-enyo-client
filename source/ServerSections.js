enyo.kind({	
	name: "plex.ServerSection",
	kind: enyo.DividerDrawer,
	captionClassName: 'library-navigation-item library-navigation-section-divider',
	published: {
		mediaServer: undefined,
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
		this.mediaServerChanged();
		this.showCaptionChanged();
	},
	mediaServerChanged: function() {
		if (this.mediaServer !== undefined) {
			this.log("creating serversection " + this.mediaServer.server.name);
			if (!this.mediaServer.pmo || !this.mediaServer.pmo.MediaContainer.Directory)
			return;	

			for (var j = this.mediaServer.pmo.MediaContainer.Directory.length - 1; j >= 0; j--){
				var r = this.mediaServer.pmo.MediaContainer.Directory[j];
				this.sections.push(r);
			};
			//this.$.sectionList.render();
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
			
			//this.log("ritar sektion: " + section.title);
			return true;
		}

		return false;
	},
	sectionRowSelected: function(inSender, inEvent) {
		this.selectedRow = inEvent.rowIndex;
		//send both the server and the section that was chosen upstreams, this will eventually end up in the grid
		this.doRowSelected(this.sections[this.selectedRow], this.mediaServer.server);
		this.$.sectionList.render();
	}
});
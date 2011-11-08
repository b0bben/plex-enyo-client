enyo.kind({
	name: "plex.SectionsView",
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
		//this.render();
		//this.$.cells.destroyControls();
		//this.$.serverList.render();
	},
	setupServerItems: function(inSender, inIndex) {
				var mediaObj = this.parentMediaContainer[inIndex];
				if (mediaObj !== undefined) {
					this.log("creating server " + mediaObj.server.name);
					this.$.cells.createComponents([{kind: "plex.ServerSection", onRowSelected: "sectionRowSelected", 
																				mediaServer: mediaObj, 
																				caption: this.parentMediaContainer.length == 1 ? "" : mediaObj.server.name, 
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

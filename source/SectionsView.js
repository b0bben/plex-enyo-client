enyo.kind({
	name: "plex.SectionsView",
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
		this.isLocal = false;
		this.isMyPlex = false;
		this.headerContentChanged();
		this.$.cells.destroyControls();
		//this.parentMediaContainerChanged();
		this.objCurrNavItem = "";
		this.selectedRow = -1;
	},
	headerContentChanged: function() {
		//this.$.header.setContent(this.headerContent);
	},
	localMediaContainerChanged: function() {
		this.isLocal = true;
		this.render();
		//this.$.cells.destroyControls();
		//this.$.serverList.render();
	},
	myplexMediaContainerChanged: function() {
		this.isMyPlex = true;
		this.render();
		//this.$.cells.destroyControls();
		//this.$.serverList.render();
	},
	setupServerItems: function(inSender, inIndex) {
		
		var	pmc = this.isLocal ? this.localMediaContainer : this.myplexMediaContainer;


		var mediaObj = this.pmc[inIndex];
		if (mediaObj !== undefined) {
			this.log("creating local: " + this.isLocal + " / myplex: " + this.isMyPlex);
			this.$.cells.createComponents([{kind: "plex.MyPlexSection", onRowSelected: "sectionRowSelected", 
																		mediaServer: mediaObj, 
																		caption: this.isLocal ? $L("My library") : $L("Shared library"), 
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

enyo.kind({
	name: "plex.MainView",
	kind: enyo.HFlexBox,
	components: [
		{kind:enyo.VFlexBox, width:'320px', style:"border-right: 2px solid;", components: [
			{flex: 1, name: "left_pane", kind: "Pane", components: [
			
			]}
		]},
		{kind:enyo.VFlexBox, flex:1, components: [
 			{flex: 1, name: "right_pane", align: "center", pack: "center",kind: "Pane", onSelectView: "viewSelected", components: [
 			    {kind: "plex.WelcomeView", name:"welcome_view"},
          {kind: "plex.GridView", name: "grid_view"}
			]}
		]}		
	],
	create: function() {
		this.inherited(arguments);
		this.$.right_pane.selectViewByName("welcome_view");
		this.rootMediaContainer = "";
		this.selectedSection = "";
		var plexReq = new PlexRequest(enyo.bind(this,"gotSections"));
		plexReq.librarySections();
		
	},
	gotSections: function(plexMediaContainer) {
		this.rootMediaContainer = plexMediaContainer;
		 this.$.left_pane.createComponents([{kind: "plex.SectionsView", name: "view_sections", parentMediaContainer: plexMediaContainer,headerContent: plexMediaContainer.title1, flex:1, owner:this}]);
		 this.log("fyllde på sektioner");
		 this.$.left_pane.render();
		 this.$.left_pane.selectViewByName("view_sections");
	},
	showGridView: function(index) {
		this.selectedSection = this.rootMediaContainer.Directory[index];
    this.$.right_pane.selectViewByName("grid_view");
	},
	viewSelected: function(inSender, inView, inPreviousView) {
	    inView.setParentMediaContainer(this.selectedSection);
	},
});
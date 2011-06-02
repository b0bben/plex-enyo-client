enyo.kind({
	name: "plex.MainView",
	kind: enyo.HFlexBox,
	components: [
/*		{kind:enyo.VFlexBox, width:'320px', style:"border-right: 2px solid;", components: [
			{flex: 1, name: "left_pane", kind: "Pane", components: [
			
			]}
		]},
		{kind:enyo.VFlexBox, flex:1, components: [
 			{flex: 1, name: "right_pane", align: "center", pack: "center",kind: "Pane", onSelectView: "viewSelected", components: [
 			    {kind: "plex.WelcomeView", name:"welcome_view"},
          {kind: "plex.GridView", name: "grid_view"}
			]}
		]}*/
		{name: "slidingPane", kind: "SlidingPane", flex: 1, onSelectView: "viewSelected", components: [
					{name: "left_pane", width: "320px", fixedWidth: true, components: [
						
					]},
					{name: "middle_pane", width: "100%", fixedWidth: true,components: [
					  {kind: "plex.GridView", name: "grid_view"}
					]},
					{name: "right_pane", dismissible: true, components: [
  					//{kind: "plex.PreplayView", name: "preplay_view"}
					]}
				]}		
	],
	create: function() {
		this.inherited(arguments);
		//this.$.right_pane.selectViewByName("welcome_view");
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
		 //this.$.left_pane.selectViewByName("view_sections");
	},
	showGridView: function(index) {
		this.selectedSection = this.rootMediaContainer.Directory[index];
    this.$.grid_view.setParentMediaContainer(this.selectedSection);
    //this.$.middle_pane.render();
    //this.$.slidingPane.selectViewByName("middle_pane");
	},
	viewSelected: function(inSender, inView, inPreviousView) {
	    //inView.setParentMediaContainer(this.selectedSection);
	    //inView.render();
	},
	showViewForMediaObject: function(pmo) {
	  switch(pmo.type) {
	    case "artist":
	      this.log("artist chosen");
	      this.showArtist(pmo);
	      break;
	    case "movie":
	      this.showPreplay(pmo);
	      break;
	    case "show":
	      this.log("show chosen");
	      break;
	  }
	},
	showArtist: function(pmo) {
	  this.$.right_pane.destroyControls();
	  this.$.right_pane.createComponents([{kind: "plex.ArtistView", owner: this, plexMediaObject: pmo}]);
	  this.$.right_pane.render();

	  this.$.right_pane.setShowing(true);
	  this.$.slidingPane.selectViewByName("right_pane");
	},
	showPreplay: function(pmo) {
	  this.$.right_pane.destroyControls();
	  this.$.right_pane.createComponents([{kind: "plex.PreplayView", owner: this, plexMediaObject: pmo}]);
	  this.$.right_pane.render();

	  this.$.right_pane.setShowing(true);
	  this.$.slidingPane.selectViewByName("right_pane");

	  
	},
});
enyo.kind({
	name: "plex.GridView",
	kind: enyo.VFlexBox,
	className: "enyo-fit",
	published: {
		parentMediaContainer: undefined,
		server: undefined,
	},
	components: [
		{name: "shadow", className: "enyo-sliding-view-shadow"},
		{kind: "Header",className: "enyo-header-dark", components: [
			{kind: enyo.Spacer},
			{name: "grid_header", content: "Welcome to Plex", style: '-webkit-box-align: center !important',pack: 'center'},
			{kind: enyo.Spacer},
			{kind: "ToolButton", caption: "Filter", onclick: "sectionFilterClick"},
			{kind: "Menu", name: "filterMenu", defaultKind: "MenuCheckItem"},
		]},

		{name: "grid_list", kind: "VirtualList", className: "list", onSetupRow: "listSetupRow", height: "100%",components: [

			{name: "cells", kind: "HFlexBox", pack: "start"}
		]},
		{kind: "Selection"},
		{kind: "plex.EmptyToaster", name: "emptyToaster"},
	],
	create: function() {
		this.count = 0;
		this.filterLevel = "";
		this.mediaContainer="";
		this.inherited(arguments);
		this.parentMediaContainerChanged();
	},
	rendered: function() {
		this.inherited(arguments);
		this.buildCells();
	},
	resizeHandler: function() {
		this.buildCells();
		this.$.grid_list.refresh();
	},
	sectionFilterClick: function(inSender) {
		console.log(inSender.id);
		this.$.filterMenu.openAroundControl(inSender);
	},
	reloadSectionWithFilterLevel: function(level) {
  	if (this.parentMediaContainer !== undefined) {
  		//get the section details
  	  window.PlexReq.setCallback(enyo.bind(this,"gotMediaObject"));
  		this.server = this.parentMediaContainer.server;
  	  window.PlexReq.getSectionForKey(this.parentMediaContainer.server,this.parentMediaContainer.section.key,level);
  	}
	},
	parentMediaContainerChanged: function() {
		this.$.selection.clear();
		this.$.grid_list.refresh();

	  if (this.parentMediaContainer !== undefined) {
			//get the section details
	    window.PlexReq.setCallback(enyo.bind(this,"gotMediaContainer"));
			this.server = this.parentMediaContainer.server;
			var key = this.parentMediaContainer.section.path ? this.parentMediaContainer.section.path : this.parentMediaContainer.section.key;
  		window.PlexReq.getSectionForKey(this.parentMediaContainer.server,key);
	    
			//get different filtering options for this section
			//window.PlexReq.setCallback(enyo.bind(this,"gotFiltersForSection"));
			//window.PlexReq.getFiltersForSectionAndKey(this.parentMediaContainer.server,this.parentMediaContainer.section.key);
	    
			this.$.grid_header.setContent(this.parentMediaContainer.section.title);
	  }
	},
	gotFiltersForSection: function(pmc) {
		for (var i=0; i < pmc.Directory.length; i++) {
			var filter = pmc.Directory[i];
			
			this.$.filterMenu.createComponent({kind: enyo.MenuItem, caption: filter.title, value: filter.key, owner: this});
		};
		this.$.toolButton.setCaption(pmc.Directory[0].title);
		
		//this.$.filterMenu.
	},
	menuItemClick: function(inSender) {
	  console.log(inSender);
	  this.$.toolButton.setCaption(inSender.caption);
	  this.filterLevel = inSender.value;
	  this.reloadSectionWithFilterLevel(this.filterLevel);
	  
	},
	gotMediaContainer: function(pmc) {
		this.mediaContainer = pmc;
		this.count = parseInt(this.mediaContainer.size); //size is always there
		//start building the grid now
		this.buildCells();
		this.$.selection.clear();
		this.$.grid_list.refresh();
		
	},
	getPlexMediaObject: function(index) {
	  if (this.mediaContainer.Video != null) {
	    return this.mediaContainer.Video[index];
	  }
	  else if (this.mediaContainer.Directory != null) {
	  	if (this.count == 1)
	  		return this.mediaContainer.Directory; //if there's only 1 item in Directory, it wont be an array but the object of that item
	  	else
	    	return this.mediaContainer.Directory[index];
	  }
	},
	buildCells: function() {
		var bounds = this.$.grid_list.getBounds();
		this.log(bounds.width);
		this.cellCount = Math.floor(bounds.width / 175);
		this.log(this.cellCount);
		this.$.cells.destroyControls();
		this.cells = [];
		var numberOfGridItems = this.cellCount > this.count ? this.count : this.cellCount;
		for (var i=0; i<numberOfGridItems; i++) {
			var c = this.$.cells.createComponent({flex: 1, kind: "VFlexBox", idx: i, onclick: "cellClick", style: "padding: 8px;width: 175px;height: 220px;", owner: this});
			var imgDiv = c.createComponent({name: "coverDiv", className: "cover-shadow"});
			imgDiv.createComponent({kind: "Image", name: "coverImg", className: "cover-image"});
			c.createComponent({name: "cover_label", className: "cover-label"});
			this.cells.push(c);
		}
		this.log("cells: " + this.cells.length);
		this.$.grid_list.refresh();
	},
	listSetupRow: function(inSender, inIndex) {
		var idx = inIndex * this.cellCount;
		
		if (idx >= 0 && idx < this.count) {
			for (var i=0, c; c=this.cells[i]; i++, idx++) {
				if (idx < this.count) {
				  var pmo = this.getPlexMediaObject(idx);
					//this.log("idx: " + idx);

					//var path = window.PlexReq.getAssetUrl(this.parentMediaContainer.server,pmo.thumb);
					var thumbUrl = window.PlexReq.getImageTranscodeUrl(this.server,100,149,pmo.thumb);
					var lbl = pmo.title;
					c.applyStyle("background-color", this.$.selection.isSelected(idx) ? "#333" : null);
					//coverart img and properties
					c.$.coverDiv.$.coverImg.setSrc(thumbUrl);
					//label below cover art
					c.$.cover_label.setContent(lbl);
					//this.log("returning cover");
				} else {
				  //this.log("NOT returning cover");
					//return false;
				}

			}
			return true;
		}
		return false;
	},
	cellClick: function(inSender, inEvent, inRowIndex) {
		var idx = inEvent.rowIndex * this.cellCount + inSender.idx;
		this.$.selection.select(idx);
		//this.$.grid_list.refresh();
		
		var pmo = this.getPlexMediaObject(idx);
		this.showViewForMediaObject(pmo);
	},
	showViewForMediaObject: function(pmo) {
		  switch(pmo.type) {
		    case "artist":
		      this.log("artist chosen");
		      this.showArtist(pmo);
		      break;
		    case "movie":
		    case "episode":
		      this.showPreplay(pmo);
		      break;
		    case "show":
		      this.log("show chosen, get seasons");
			  this.getSeasons(pmo);
		      break;
		    case "season":
		    	this.log("season chosen, get episodes");
		    	this.getEpisodes(pmo);
		  }
		},
	showArtist: function(pmo) {
  		this.$.emptyToaster.$.client.destroyControls();
		  this.$.emptyToaster.$.client.createComponents([{kind: "plex.ArtistView", owner: this, plexMediaObject:pmo, server: this.server}]);
		  this.$.emptyToaster.open();
	},
	showPreplay: function(pmo) {
      this.$.emptyToaster.$.client.destroyControls();
      this.$.emptyToaster.$.client.createComponents([{kind: "plex.PreplayView", owner: this, plexMediaObject:pmo, server: this.server}]);
      this.$.emptyToaster.open();
	},
	getSeasons: function(pmo) {
		window.PlexReq.setCallback(enyo.bind(this,"refreshGridWithMediaContainer"));
		window.PlexReq.dataForUrlAsync(this.server,pmo.key);	
	},
	refreshGridWithMediaContainer: function(pmc) {
		this.gotMediaContainer(pmc);
	},
	getEpisodes: function(pmo) {
		window.PlexReq.setCallback(enyo.bind(this,"refreshGridWithMediaContainer"));
		window.PlexReq.dataForUrlAsync(this.server,pmo.key);	
	},

});
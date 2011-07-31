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

			{name: "cells", kind: "HFlexBox"}
		]},
		{kind: "Selection"},
		{kind: "plex.EmptyToaster", name: "emptyToaster"},
	],
	create: function() {
		this.count = 0;
		this.filterLevel = "";
		this.mediaContainer="";
		this.plexReq = new PlexRequest();
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
  	  this.plexReq = new PlexRequest(enyo.bind(this,"gotMediaContainer"));
  	this.server = this.parentMediaContainer.server;
  	  this.plexReq.getSectionForKey(this.parentMediaContainer.server,this.parentMediaContainer.section.key,level);
  	}
	},
	parentMediaContainerChanged: function() {
	  if (this.parentMediaContainer !== undefined) {
		//get the section details
	    this.plexReq = new PlexRequest(enyo.bind(this,"gotMediaContainer"));
		this.server = this.parentMediaContainer.server;
  this.plexReq.getSectionForKey(this.parentMediaContainer.server,this.parentMediaContainer.section.key);
	    
		//get different filtering options for this section
		this.plexReq = new PlexRequest(enyo.bind(this,"gotFiltersForSection"));
		this.plexReq.getFiltersForSectionAndKey(this.parentMediaContainer.server,this.parentMediaContainer.section.key);
    
	  
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
		
    	switch (this.getMediaType()) {
	      case "movie":
	        this.count = this.mediaContainer.Video.length;
	        break;
	      case "artist":
	      case "show":
	        this.count = this.mediaContainer.Directory.length;
	        break;
	      default:
	        this.count = 0;
	        break;
	    }
      
		
		this.buildCells();
		this.$.selection.clear();
		this.$.grid_list.refresh();
		
	},
	getMediaType: function() {
	  if (this.mediaContainer.Video != null) {
	    return this.mediaContainer.Video[0].type;
	  }
	  else if (this.mediaContainer.Directory != null) {
	    return this.mediaContainer.Directory[0].type;
	  }
	  else
	    return "unknown";
	},
	getPlexMediaObject: function(index) {
	  if (this.mediaContainer.Video != null) {
	    return this.mediaContainer.Video[index];
	  }
	  else if (this.mediaContainer.Directory != null) {
	    return this.mediaContainer.Directory[index];
	  }
	},
	buildCells: function() {
		var bounds = this.$.grid_list.getBounds();
		this.cellCount = Math.floor(bounds.width / 175);
		this.log(this.cellCount);
		this.$.cells.destroyControls();
		this.cells = [];
		for (var i=0; i<this.cellCount; i++) {
			var c = this.$.cells.createComponent({flex: 1, kind: "VFlexBox", idx: i, onclick: "cellClick", pack: "center", align: "center", style: "padding: 8px;width: 175px;height: 220px;", owner: this});
			var imgDiv = c.createComponent({name: "coverDiv", className: "cover-shadow"});
			imgDiv.createComponent({kind: "Image", name: "coverImg", className: "cover-image"});
			c.createComponent({name: "cover_label", className: "cover-label"});
			this.cells.push(c);
		}
		this.$.grid_list.refresh();
	},
	listSetupRow: function(inSender, inIndex) {
		var idx = inIndex * this.cellCount;
		
		if (idx >= 0 && idx < this.count) {
			for (var i=0, c; c=this.cells[i]; i++, idx++) {
				if (idx < this.count) {
				  var pmo = this.getPlexMediaObject(idx);
					//this.log("idx: " + idx);

					var path = this.parentMediaContainer.server.baseUrl + pmo.thumb;
					var lbl = pmo.title;
					c.applyStyle("background-color", this.$.selection.isSelected(idx) ? "#333" : null);
					//coverart img and properties
					c.$.coverDiv.$.coverImg.setSrc(path);
					//label below cover art
					c.$.cover_label.setContent(lbl);
				} else {
					return false;
					//c.destroyControls();
				}

			}
			return true;
		}
		return false;
	},
	cellClick: function(inSender, inEvent, inRowIndex) {
		var idx = inEvent.rowIndex * this.cellCount + inSender.idx;
		this.$.selection.select(idx);
		this.$.grid_list.refresh();
		
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
		      this.showPreplay(pmo);
		      break;
		    case "show":
		      this.log("show chosen");
			  this.showArtist(pmo);
		      break;
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
});
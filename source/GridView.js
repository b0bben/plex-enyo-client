enyo.kind({
	name: "plex.GridView",
	kind: enyo.VFlexBox,
	className: "enyo-fit",
	published: {
		parentMediaContainer: undefined,
	},
	components: [
		{name: "shadow", className: "enyo-sliding-view-shadow"},
		{kind: "PageHeader", name: "grid_header", style: '-webkit-box-align: center !important',pack: 'center',content: "bob", className: "enyo-header-dark"},

			{name: "grid_list", kind: "VirtualList", className: "list", onSetupRow: "listSetupRow", height: "100%",components: [

				{name: "cells", kind: "HFlexBox",onclick: "cellsClick"}
			]},
			{kind: "Selection"},
			{kind: "plex.EmptyToaster", name: "emptyToaster"}
	],
	create: function() {
		this.count = 0;
		this.mediaContainer="";
		this.plexReq = new PlexRequest();
		this.inherited(arguments);
		this.parentMediaContainerChanged();
		this.$.grid_list.refresh();
	},
	rendered: function() {
		this.inherited(arguments);
		this.buildCells();
		this.$.grid_list.refresh();
	},
	resizeHandler: function() {
		this.buildCells();
		this.$.grid_list.refresh();
	},
	loadData: function(inSender) {
		this.count = 100;
		this.$.grid_list.refresh();
	},
	parentMediaContainerChanged: function() {
	  if (this.parentMediaContainer !== undefined) {
	    this.plexReq = new PlexRequest(enyo.bind(this,"gotMediaContainer"));
	    this.plexReq.getSectionForKey(this.parentMediaContainer.key);
	    this.$.grid_header.setContent(this.parentMediaContainer.title);
	  }
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
		this.$.grid_list.render();
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
			var c = this.$.cells.createComponent({flex: 1, kind: "VFlexBox", pack: "center", align: "center", style: "padding: 8px;width: 175px;height: 220px;", owner: this, idx: i, onclick: "cellClick"});
			c.createComponent({kind: "Image", className: "cover-image"});
			c.createComponent({kind: "Item", name: "cover_label", className: "cover-label"});
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
					this.log("idx: " + idx);

					var path = this.plexReq.baseUrl + pmo.thumb;
					var lbl = pmo.title;
					c.applyStyle("background-color", this.$.selection.isSelected(idx) ? "#333" : null);
				} else {
					path = "images/BlankPoster.png";
				}
				//coverart img and properties
				c.$.image.setSrc(path);
				//label below cover art
				c.$.cover_label.setContent(lbl);
			}
			return true;
		}
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
		      break;
		  }
		},
		showArtist: function(pmo) {
  		this.$.emptyToaster.$.client.destroyControls();
		  this.$.emptyToaster.$.client.createComponents([{kind: "plex.ArtistView", owner: this, plexMediaObject:pmo}]);
		  this.$.emptyToaster.open();
		},
		showPreplay: function(pmo) {
      this.$.emptyToaster.$.client.destroyControls();
      this.$.emptyToaster.$.client.createComponents([{kind: "plex.PreplayView", owner: this, plexMediaObject:pmo}]);
      this.$.emptyToaster.open();
		},
});
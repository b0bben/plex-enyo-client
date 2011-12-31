enyo.kind({
	name: "plex.StartView",
	kind: enyo.VFlexBox,
	className: "enyo-fit",
	published: {
		mediaContainer: undefined,
		server: undefined,
	},
	components: [
		{name: "shadow", className: "enyo-sliding-view-shadow"},
		{kind: "Header",className: "enyo-header-dark", components: [
			{kind: enyo.Spacer},
			{name: "grid_header", content: $L("Recently added movies"), style: '-webkit-box-align: center !important',pack: 'center'},
			{kind: enyo.Spacer},
		]},

		{name: "grid_list", kind: "VirtualList", className: "list", onSetupRow: "listSetupRow", height: "100%",components: [

			{name: "cells", kind: "HFlexBox", pack: "start"}
		]},
		{kind: "Selection"},
		{kind: "plex.EmptyToaster", name: "emptyToaster"},
	],
	create: function() {
		this.count = 0;
		this.inherited(arguments);
		this.mediaContainerChanged();
	},
	rendered: function() {
		this.inherited(arguments);
		this.buildCells();
	},
	resizeHandler: function() {
		this.buildCells();
		this.$.grid_list.refresh();
	},
	mediaContainerChanged: function() {
	  if (this.mediaContainer !== undefined) {
	  	this.count = parseInt(this.mediaContainer.size); //size is always there
		//start building the grid now
		this.buildCells();
		this.$.selection.clear();
		this.$.grid_list.refresh();
		//this.$.grid_header.setContent($L("Recently added"));
	  }
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

					var path = this.server.baseUrl + pmo.thumb;
					var lbl = pmo.title;
					c.applyStyle("background-color", this.$.selection.isSelected(idx) ? "#333" : null);
					//coverart img and properties
					c.$.coverDiv.$.coverImg.setSrc(path);
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
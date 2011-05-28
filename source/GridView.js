enyo.kind({
	name: "plex.GridView",
	kind: enyo.VFlexBox,
	className: "enyo-fit",
	style: "background-color: #222;",
	published: {
		parentMediaContainer: "",
	},
	components: [
		{name: "shadow", className: "enyo-sliding-view-shadow"},
		{kind: "PageHeader", name: "grid_header", style: '-webkit-box-align: center !important',pack: 'center',content: "bob", className: "enyo-header-dark"},
		{kind: "Scroller",flex: 2,components: [
			{name: "grid_list", kind: "VirtualList", className: "list", onSetupRow: "listSetupRow",height: "1000px",components: [

				{name: "cells", kind: "HFlexBox",onclick: "cellsClick", style: "background-color: #222;"}
			]},
			{kind: "Selection"},
			{kind: "plex.PreplayView", name: "preplay_view"}
		]},
		

	],
	create: function() {
		this.count = 0;
		this.mediaContainer="";
		this.plexReq = new PlexRequest();
		this.inherited(arguments);
		this.parentMediaContainerChanged();
	},
	rendered: function() {
		this.inherited(arguments);
	},
	resizeHandler: function() {
		//this.buildCells();
		//this.$.grid_list.refresh();
	},
	loadData: function(inSender) {
		this.count = 100;
		this.$.grid_list.refresh();
	},
	parentMediaContainerChanged: function() {
	    this.plexReq = new PlexRequest(enyo.bind(this,"gotMediaContainer"));
	    this.plexReq.getSectionForKey(this.parentMediaContainer.key);
	    this.$.grid_header.setContent(this.parentMediaContainer.title);
	},
	gotMediaContainer: function(pmc) {
		this.mediaContainer = pmc;
		this.count = this.mediaContainer.Video.length;
		this.buildCells();
		this.$.grid_list.render();
		this.$.grid_list.refresh();
		
	},
	buildCells: function() {
		var bounds = this.$.grid_list.getBounds();
		this.cellCount = Math.floor(bounds.width / 156);
		this.log(this.cellCount);
		this.$.cells.destroyControls();
		this.cells = [];
		for (var i=0; i<this.cellCount; i++) {
			var c = this.$.cells.createComponent({flex: 1, kind: "VFlexBox", pack: "center", align: "center", style: "padding: 8px;width: 175px;height: 220px;", owner: this, idx: i, onclick: "cellClick"});
			c.createComponent({kind: "Image", className: "cover-image"});
			c.createComponent({kind: "Item", name: "cover_label", className: "cover-label"});
			this.cells.push(c);
		}
	},
	listSetupRow: function(inSender, inIndex) {
		var idx = inIndex * this.cellCount;
		
		if (idx >= 0 && idx < this.count) {
			for (var i=0, c; c=this.cells[i]; i++, idx++) {
				if (idx < this.count) {
					var pmo = this.mediaContainer.Video[idx];
					//this.log("idx: " + idx);
					//this.log("i: " + inSender);
					var path = this.plexReq.baseUrl + pmo.thumb;//"images/BlankPoster.png";
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
		
		var pmo = this.mediaContainer.Video[idx];
		this.$.preplay_view.setPlexMediaObject(pmo);
		this.$.preplay_view.open();
	},
	multiModeChange: function(inSender) {
		this.$.selection.setMulti(inSender.getState());
		this.$.grid_list.refresh();
	}
});
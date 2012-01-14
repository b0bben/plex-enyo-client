enyo.kind({
	name: "plex.GridView",
	kind: enyo.VFlexBox,
	className: "enyo-fit",
	flex: 1,
	width: "100%",
	published: {
		parentMediaContainer: undefined,
		server: undefined,
	},
	components: [
		{name: "shadow", className: "enyo-sliding-view-shadow"},
		{kind: "Header",className: "enyo-header-dark", components: [
			{kind: "Button", name: "backBtn", showing: false, onclick: "goBack", className: "enyo-button-dark", style: "padding: 0px 5px 0 0;", layoutKind: "HFlexLayout", pack: "start", align: "center",components: [
    			{kind: enyo.Image, src: "images/icn-back.png", style: "height:24px; width:24px;"},
    			{name: "backBtnCaption", content: ""},
			]},
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
		this.viewStack = [];
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
  	  window.PlexReq.setCallback(enyo.bind(this,"gotMediaContainer"));
  		this.server = this.parentMediaContainer.server;
  	  window.PlexReq.getSectionForKey(this.parentMediaContainer.server,this.parentMediaContainer.section.key,level);
  	}
	},
	parentMediaContainerChanged: function() {
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
	gotMediaContainer: function(pmc, saveInStack) {
		this.log();
		if (saveInStack && pmc) {
			this.viewStack.push(pmc); //save for later user
			this.stackPosition = this.viewStack.length-1;
		}
		
		this.mediaContainer = pmc;
		this.count = parseInt(this.mediaContainer.size); //size is always there
		//start building the grid now
		this.buildCells();
		this.$.selection.clear();
		this.$.grid_list.punt();

		//set grid title to something we care about
		if (this.mediaContainer.title2) {
			this.$.grid_header.setContent(this.mediaContainer.title2);
		}
		else {
			this.$.grid_header.setContent(this.mediaContainer.title1);	
		}
		
		this.$.backBtn.setShowing(false); //reset this incase we're going back in the view stack

		switch(pmc.viewGroup) {

	    case "season":
	    case "episode":
	      this.log("grid showing tvshows");
	      this.$.backBtnCaption.setContent(pmc.title1);
	      this.$.backBtn.setShowing(true);
	      //var thumbUrl = window.PlexReq.getImageTranscodeUrl(this.server,900,60,pmc.banner);
		  	//this.$.header.applyStyle("background-image", "url(" + thumbUrl + ")");
		  	
	      break;
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
			var c = this.$.cells.createComponent({flex: 1, kind: "VFlexBox", idx: i, onclick: "cellClick", style: "padding: 8px;width: 175px;", owner: this});
			var imgDiv = c.createComponent({name: "coverDiv", className: "cover-shadow"});
			var cover = imgDiv.createComponent({kind: "Image", name: "coverImg"});
			c.createComponent({name: "cover_label", className: "cover-label"});
			c.createComponent({name: "cover_sublabel", className: "cover-sublabel"});
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
					if (pmo === undefined) {
						return true;
					}
					if (pmo.thumb !== undefined) {
						var thumbUrl = window.PlexReq.getImageTranscodeUrl(this.server,200,200,pmo.thumb);
						//coverart img and properties
						c.$.coverDiv.$.coverImg.setSrc(thumbUrl);						
					}

					var lbl = pmo.title;
					c.applyStyle("background-color", this.$.selection.isSelected(idx) ? "#333" : null);

					//change cover size depening if we're showing episodes/artist/else...
					if (pmo.type === "artist") {
						c.$.coverDiv.$.coverImg.addRemoveClass("cover-image-artist",true);
						c.$.coverDiv.addRemoveClass("cover-shadow", false);
					}
					else if (pmo.type === "episode") {
						c.$.coverDiv.$.coverImg.addRemoveClass("cover-image-episode",true);
						c.$.coverDiv.addRemoveClass("cover-shadow", false);
						if (pmo.parentIndex) {
							c.$.cover_sublabel.setContent($L("Season ") + pmo.parentIndex + $L(", Episode ") + pmo.index);	
						}
						else {
							c.$.cover_sublabel.setContent($L("Episode ") + pmo.index);
						}
						
					}
					else {
						c.$.coverDiv.$.coverImg.addRemoveClass("cover-image",true);
						c.$.coverDiv.addRemoveClass("cover-shadow", true);
						c.$.cover_sublabel.setContent(pmo.year);
					}
					
					
					if (pmo.viewOffset) {
						var d = c.$.coverDiv.createComponent({content: ""})
						d.addRemoveClass("watched_flag",true);
					}
					c.$.cover_label.setContent(lbl);					
					//this.log("returning cover");
				} else {
				  //this.log("NOT returning cover");
					return false;
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
		if (!pmo.type) { //allLEaves or something else strange
			this.getChildren(pmo);
		}

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
		  this.getChildren(pmo);
	      break;
	    case "season":
	    	this.log("season chosen, get episodes");
	    	this.getChildren(pmo);
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
	refreshGridWithMediaContainer: function(pmc) {
		this.gotMediaContainer(pmc,true);
	},
	getChildren: function(pmo) {
		window.PlexReq.setCallback(enyo.bind(this,"refreshGridWithMediaContainer"));
		window.PlexReq.dataForUrlAsync(this.server,pmo.key);	
	},
	goBack: function() {
		this.log();
		this.viewStack.pop(); //remove the last (current) view from the stack, we don't want it in there cause that would be weird
		this.stackPosition -= 1;

		this.gotMediaContainer(this.viewStack[this.stackPosition],false); //render previous view without saving it in the view stack
	},

});
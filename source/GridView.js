enyo.kind({
	name: "plex.GridView",
	kind: "enyo.VFlexBox",
	/*className: "enyo-fit",*/
	flex: 1,
	dragAnywhere: false,
	published: {
		parentMediaContainer: undefined,
		server: undefined,
	},
	events: {
		onShowPreplay:"",
	},
	components: [
		{kind: "Scrim", onclick: "scrimClick", components: [
			{kind: "enyo.SpinnerLarge", name: "spinner", showing: true, style: '-webkit-box-align: center !important;position: absolute;top:30%;right:45%',pack: 'center'},
		]},
		{kind: "Header",className: "enyo-header-dark", components: [
			{kind: "Button", name: "backBtn", showing: false, onclick: "goBack", className: "enyo-button-dark", style: "padding: 0px 5px 0px 0px;", layoutKind: "HFlexLayout", pack: "start", align: "center",components: [
				{kind: enyo.Image, src: "images/icn-back.png", style: "height:24px; width:24px;"},
				{name: "backBtnCaption", content: ""},
			]},
		{kind: enyo.Spacer},
		{name: "grid_header", content: "Welcome to Plex", style: '-webkit-box-align: center !important',pack: 'center'},
		{kind: enyo.Spacer},
		{kind: "Button", name: "filterButton", className: "enyo-button-dark", style: "padding: 0;", caption: $L("Sorting"),components: [
			{kind: "ListSelector", name: "filterMenu", value: 1, onChange: "sectionFilterChanged", style: "padding-left: 5px;"},
		]},

		]},

		{name: "grid_list", kind: "VirtualList", className: "list", onSetupRow: "listSetupRow", height: "100%",components: [
			{name: "cells", kind: "HFlexBox", pack: "start"}
		]},
		{kind: "Selection"},
		{kind: "plex.EmptyToaster", name: "emptyToaster", width: "75%"},
		{kind: "Toolbar", components: [
			{kind: "GrabButton", slidingHandler: true},
		]}
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
		this.$.filterMenu.setValue(1);
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
			var key = this.parentMediaContainer.section.path ? this.parentMediaContainer.section.path : this.parentMediaContainer.section.key;
			window.PlexReq.getSectionForKey(this.server,key,level);
		}
	},
	parentMediaContainerChanged: function() {
		if (this.parentMediaContainer !== undefined) {
			this.$.scrim.show();
			//get different filtering options for this section, once that's received it's gonna ask for media containers
			window.PlexReq.setCallback(enyo.bind(this,"gotFiltersForSection"));
			if (this.parentMediaContainer.section.path) {
				window.PlexReq.getFiltersForSectionAndKey(this.parentMediaContainer.server,this.parentMediaContainer.section.path);
			} else {
				window.PlexReq.getFiltersForSectionAndKey(this.parentMediaContainer.server,this.parentMediaContainer.section.key);	
			}

			this.$.grid_header.setContent(this.parentMediaContainer.section.title);
		}
	},
	gotFiltersForSection: function(pmc) {

		this.$.filterMenu.items = [];
		for (var i=0; i < pmc.Directory.length; i++) {
			var filter = pmc.Directory[i];
			
			this.$.filterMenu.items.push({caption: filter.title, value: filter.key});
		};
		
		this.$.filterMenu.itemsChanged();
		this.$.filterMenu.render();
		this.$.filterMenu.setValue(1);

		//get the section details
		window.PlexReq.setCallback(enyo.bind(this,"gotMediaContainer"));
		this.server = this.parentMediaContainer.server;
		var key = this.parentMediaContainer.section.path ? this.parentMediaContainer.section.path : this.parentMediaContainer.section.key;
		window.PlexReq.getSectionForKey(this.parentMediaContainer.server,key);
	},
	sectionFilterChanged: function(inSender,inValue, inOldValue) {
		this.log(inValue);
		this.filterLevel = inValue;
		this.reloadSectionWithFilterLevel(this.filterLevel);
	},
	gotMediaContainer: function(pmc, saveInStack) {
		this.log();
		this.count = 0;
		this.$.selection.clear();
		//this.$.grid_list.punt();

		if (saveInStack && pmc) {
			this.viewStack.push(pmc); //save for later user
			this.stackPosition = this.viewStack.length-1;
		}
		
		this.mediaContainer = pmc;
		this.count = parseInt(this.mediaContainer.size); //size is always there
		//start building the grid now
		this.buildCells();


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

		this.$.scrim.hide();
	},
	getPlexMediaObject: function(index) {
		if (this.mediaContainer.Video != null) {
			if (this.count == 1)
				return this.mediaContainer.Video; //if there's only 1 item in Directory, it wont be an array but the object of that item
			else
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
			var imgDiv = c.createComponent({name: "coverDiv", className: "cover-shadow", style: "position:relative;"});
			var cover = imgDiv.createComponent({kind: "Image", name: "coverImg"});
			var seenFlag = imgDiv.createComponent({name: "seenFlag", content: "", className: "seenFlag", pack: "start", align: "center"});
			c.createComponent({name: "cover_label", className: "cover-label"});
			c.createComponent({name: "cover_sublabel", className: "cover-sublabel"});
			this.cells.push(c);
		}
		this.log("cells: " + this.cells.length);
	
		
		this.$.grid_list.punt();
		this.$.grid_list.refresh();

	},
	listSetupRow: function(inSender, inIndex) {
		var idx = inIndex * this.cellCount;
		//this.log("idx: " + idx);
		//this.log("count: " + this.count);
		//this.log("cells: " + this.cellCount);
		if (idx >= 0 && idx < this.count) {
			for (var i=0, c; c=this.cells[i]; i++, idx++) {
				var gridItemsLeft = this.count - idx;
				//this.log("gridItemsLeft: " + gridItemsLeft);
				//this.log("i: " + i);
				if (idx < this.count) {
					var pmo = this.getPlexMediaObject(idx);
					if (pmo === undefined) {
						//this.log("den tomma");
						break;
					}
					if (pmo.thumb !== undefined) {
						var thumbUrl = window.PlexReq.getImageTranscodeUrl(this.server,200,200,pmo.thumb);
						//coverart img and properties
						c.$.coverDiv.$.coverImg.setSrc(thumbUrl);						
					}
					else {
						c.$.coverDiv.$.coverImg.setSrc("");	
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
					
					c.$.cover_label.setContent(lbl);

					switch (pmo.type) {
						case "episode":
						case "movie":
							if (pmo.type === "movie") {
								c.$.coverDiv.$.seenFlag.setStyle("top: -9%");
							}
							//watched/unwatched falgs
							if (pmo.viewOffset > 0) {
								//partly watched, mark with image
								c.$.coverDiv.$.seenFlag.setClassName("seenFlag partly_watched");
							}
							else if (!pmo.viewCount) {
								//unwatched, mark with image
								c.$.coverDiv.$.seenFlag.setClassName("seenFlag unwatched");
							}
							else {
								//watched, remove any marker
								c.$.coverDiv.$.seenFlag.setClassName("");
							}
							break;
						case "show":
						case "season":
							if (pmo.leafCount && pmo.viewedLeafCount) {
								var unwatchedItems = pmo.leafCount - pmo.viewedLeafCount;
								c.$.coverDiv.$.seenFlag.setContent(unwatchedItems);
								c.$.coverDiv.$.seenFlag.setClassName("unwatched_count");	
							}
							
						default:
							break;
					}
				} else {
					c.$.coverDiv.hide();
					c.$.cover_label.hide();
					c.$.cover_sublabel.hide();
					//this.log("break");
					//break;
				}

			}
			//this.log("returning " + idx);
			return true;
		}
		//this.log("NOT returning " + idx);
		return false;
	},
	cellClick: function(inSender, inEvent, inRowIndex) {
		var idx = inEvent.rowIndex * this.cellCount + inSender.idx;
		this.$.selection.select(idx);
		//this.$.grid_list.refresh();
		
		var pmo = this.getPlexMediaObject(idx);
				//those pesky nested filters, like /library/sections/6/decade/2010
		if (this.mediaContainer.viewGroup === "secondary") {
			this.log("secondary viewGroup");
			this.reloadSectionWithFilterLevel(this.filterLevel + "/" + pmo.key); //this.filterLevel will be saved from before, so append to that
		} else {
			this.showViewForMediaObject(pmo);	
		}
		
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
		this.$.emptyToaster.$.client.createComponents([{kind: "plex.PreplayView", owner: this, plexMediaObject:pmo, server: this.server, art: this.mediaContainer.art}]);
		this.$.emptyToaster.open();
		//this.doShowPreplay(this.server,pmo);
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
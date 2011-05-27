/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "plex.ButtonMenu",
	kind: enyo.HFlexBox,
	noScroller: true,
	pack: "left", 
	align: "center",
	published: {
		headerContent: "",
		menuList: []
	},
	components: [
		{name: "sectionImage", kind: "Image", width: "36px",heigth: "36px"},
		{name: "sectionName", content: "TV Shows", style: "margin-left: 25px"},
	],
	create: function() {
		this.inherited(arguments);
		this.headerContentChanged();
		this.menuListChanged();
	},
	menuListChanged: function() {
		this.log("menuListChanged");
	},
	headerContentChanged: function() {
		this.log("headerContentChanged");
		this.$.sectionName.setContent(this.headerContent.title);
		switch(this.headerContent.type)
		{
			case 'movie':
				this.$.sectionImage.setSrc("images/Movies.png");
				break;
			case 'show':
				this.$.sectionImage.setSrc("images/TVShows.png");
				break;
			case 'artist':
				this.$.sectionImage.setSrc("images/Music.png");
				break;
			default:
				this.log("unknown section");
				break;
		}
		
	},

});
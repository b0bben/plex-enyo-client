enyo.kind({
	name: "plex.ButtonMenu",
	kind: enyo.HFlexBox,
	noScroller: true,
	pack: "left", 
	align: "center",
	published: {
		headerContent: "",
		menuList: [],
	},
	components: [
		{name: "sectionImage", kind: "Image", width: "36px",heigth: "36px"},
		{kind: enyo.VFlexBox, align: "right", components: [
			{name: "sectionName", content: "TV Shows", style: "margin-left: 25px"},
			{name: "serverName", content: "mini-tv", style: "margin-left: 25px;font-size: 12px;color: gray;"},		
		]},
	],
	create: function() {
		this.inherited(arguments);
		this.menuListChanged();
	},
	menuListChanged: function() {
		//this.log("menuListChanged");
	},
	headerContentChanged: function() {
		//this.log("headerContentChanged");
		this.$.sectionName.setContent(this.headerContent.title);
		this.$.serverName.setContent(this.headerContent.serverName);
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
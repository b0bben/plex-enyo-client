enyo.kind({
	name: "plex.PreplayView", 
  kind: enyo.VFlexBox,
  className: "enyo-fit",
	published: {
		plexMediaObject: "",
		server: undefined,
	},
	components: [
		{name: "backdrop", className: "backdrop", components: [
			{name: "backdropImg", kind: "Image", className: "backdrop-img"},
		]},
		{className: "enyo-sliding-view-shadow"},
		{kind: enyo.VFlexBox, height: "92%",name:"details",components: [
      		{kind: enyo.HFlexBox, width: "100%", flex: 2, components: [
        		{className: "cover", components: [
				  {name: "thumb", kind: "Image", className: "thumb"},
				]},
        		{kind: enyo.HFlexBox, className: "title_holder", components: [
          {name: "title", className: "title"},
          {name: "year", className: "year"},
          {kind: enyo.HFlexBox, className:"rating_holder", components: [
            {name: "rating_1", kind: "Image"},
            {name: "rating_2", kind: "Image"},
            {name: "rating_3", kind: "Image"},
            {name: "rating_4", kind: "Image"},
            {name: "rating_5", kind: "Image"},  
          ]},
        ]},
        {name: "tagline", className: "tagline"},
        {name: "desc", className: "desc"},
		//{kind: "Video", src: "http://www.w3schools.com/html5/movie.mp4"}
      ]},
		]},
		{kind: "Toolbar", align: "center", components: [
  			{name: "dragHandle", kind: "GrabButton", onclick: "closeMyself"},
			{ name: 'playButton', 
				kind: 'Button', 
				className: 'photos button', 
				caption: ' ', 
				onclick: 'clickPlay', 
				components: [{kind: 'Image', src:'images/icn-slideshow.png' }]
			}
  		]}
	],
	create: function() {
		this.inherited(arguments);
		this.plexReq = new PlexRequest();
		this.plexMediaObjectChanged();
	},
	plexMediaObjectChanged: function() {
		if (this.plexMediaObject !== undefined) {
			this.log("preplay with: " + this.plexMediaObject.title);
			this.$.thumb.setSrc(this.server.baseUrl + this.plexMediaObject.thumb);
			this.$.title.setContent(this.plexMediaObject.title);
			this.$.year.setContent(this.plexMediaObject.year);
			this.$.tagline.setContent(this.plexMediaObject.tagline);		
			this.$.desc.setContent(this.plexMediaObject.summary);
			//this.$.video.setSrc(this.server.baseUrl + this.plexMediaObject.Media.Part.key);
			
			//this.$.thumb.setSrc("images/BlankPoster.png");
			this.$.backdropImg.setSrc(this.server.baseUrl + this.plexMediaObject.art);
			this.render();
		}
	},
	doClose: function() {
		this.close();
	},
	clickPlay: function() {
		//var video = this.createComponent({kind: "Video", src: "http://www.w3schools.com/html5/movie.mp4"});
		//this.$.video.node.webkitEnterFullscreen();
		this.$.video.play();
	}
})
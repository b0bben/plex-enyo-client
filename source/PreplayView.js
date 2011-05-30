enyo.kind({
	name: "plex.PreplayView", 
	kind: enyo.Toaster, 
	flyInFrom: "right", 
	style: "top: 0px; bottom: 0px", 
	width: "930px",
	lazy: false,
	scrim: false,
	published: {
		plexMediaObject: "",
	},
	components: [
		{className: "enyo-sliding-view-shadow"},
		{kind: enyo.VFlexBox,	height: "700px",flex: 4, name:"details",components: [
      {kind: enyo.HFlexBox, width: "100%", height: "50%", components: [
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
      ]},
      {name: "tagline", className: "tagline"},
      {name: "desc", className: "desc"},
		]},
		{kind: "Toolbar", components: [
			{kind: "GrabButton", onclick: "doClose"},
		]}

	],
	create: function() {
		this.inherited(arguments);
		this.plexReq = new PlexRequest();
		this.plexMediaObjectChanged();
	},
	plexMediaObjectChanged: function() {
		if (this.plexMediaObject != null) {
			this.log("preplay with: " + this.plexMediaObject.title);
			this.$.thumb.setSrc(this.plexReq.baseUrl + this.plexMediaObject.thumb);
			this.$.title.setContent(this.plexMediaObject.title);
			this.$.year.setContent(this.plexMediaObject.year);
			this.$.tagline.setContent(this.plexMediaObject.tagline);		
			this.$.desc.setContent(this.plexMediaObject.summary);
			
			//this.$.thumb.setSrc("images/BlankPoster.png");
			//this.$.details.applyStyle("background:#ffffff url('" + this.plexMediaObject.art + "') no-repeat right top");
		}
	},
	doClose: function() {
		this.close();
	}
})
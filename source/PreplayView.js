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
		{kind: enyo.Scroller, flex: 1, autoHorizontal: false, horizontal: false, accelerated: true, fpsShowing: true, components: [ //scroller
  		{kind: enyo.HFlexBox, style: "border: 1px solid red;", className: "enyo-fit", components: [
    		{kind: enyo.VFlexBox, pack: "start", style: "margin: 10px;border: 1px solid red;", components: [
    			{className: "cover", onclick: "startVideo",components: [
    		    {name: "thumb", kind: "Image", className: "thumb"},
    		    /*{kind: "PlexViewVideo", name: "videoView", visible: false, className: "thumb"},*/
    		  ]},
    		]}, //cover box
        {kind: enyo.VFlexBox, pack: "end", flex: 1, style: "margin: 10px;border: 1px solid blue",name:"details",components: [
              {kind: enyo.HFlexBox, className: "title_holder", components: [
                {name: "title", className: "title"},
                {name: "pgRating", kind: "Image"},        
              ]},//title,pgrating
              {kind: enyo.HFlexBox, components: [
                {name: "released", className: "info_text", content: "Released 2009-11-11", style: "margin-right},
                {name: "runtime", className: "info_text", content: "118 minutes"},
                {name: "category", className: "info_text", content: "Sci-fi"},
              ]}, //released, runtime, category
              {name: "desc", className: "desc"},  
              {kind: enyo.HFlexBox, components: [
                {content: "Director: ", className: "details-header"},
                {content: "David Bowie", className: "info_text"},
                {content: "Angelina Jolie", className: "info_text"},
                {content: "Mr. Dobalina", className: "info_text"},
              ]},              
              {kind: enyo.HFlexBox, components: [
                {content: "Writer: ", className: "details-header"},
                {content: "David Bowie", className: "info_text"},
                {content: "Angelina Jolie", className: "info_text"},
                {content: "Mr. Dobalina", className: "info_text"},
              ]},
              {kind: enyo.HFlexBox, components: [
                {content: "Cast: ", className: "details-header"},
                {content: "David Bowie", className: "info_text"},
                {content: "Angelina Jolie", className: "info_text"},
                {content: "Mr. Dobalina", className: "info_text"},
              ]},
              {kind: enyo.VFlexBox, components: [
                {kind: enyo.HFlexBox, className:"rating_holder", components: [
                  {name: "rating_1", kind: "Image"},
                  {name: "rating_2", kind: "Image"},
                  {name: "rating_3", kind: "Image"},
                  {name: "rating_4", kind: "Image"},
                  {name: "rating_5", kind: "Image"},  
                ]},
              ]},
        ]}, //descr box
  		]},
		
		]}, //scroller end
    
		{kind: "Toolbar", align: "center", components: [
  		{name: "dragHandle", kind: "GrabButton", onclick: "closeMyself"},
		  {name: 'playButton',kind: 'Button',className: 'photos button',caption: ' ',onclick: 'clickPlay',components: [
		      {kind: 'Image', src:'images/icn-slideshow.png' }
		  ]},
  	]},
  	{kind: "Toaster", name: "videoToast", style: "top: 0px;width: 1024px;height: 768px",flyInFrom: "right", components: [ 
  	  
  	]},
	],
	create: function() {
		this.inherited(arguments);
		this.plexReq = new PlexRequest();
		this.plexMediaObjectChanged();
	},
	plexMediaObjectChanged: function() {
		if (this.plexMediaObject !== undefined) {
		  //this.$.videoView.setPmo(this.plexMediaObject);
			this.log("preplay with: " + enyo.json.stringify(this.plexMediaObject));
			this.$.thumb.setSrc(this.server.baseUrl + this.plexMediaObject.thumb);
			this.$.title.setContent(this.plexMediaObject.title);
			this.$.released.setContent(this.plexMediaObject.year);
			//this.$.tagline.setContent(this.plexMediaObject.tagline);
			this.$.category.setContent("Sci-fi");
			this.$.runtime.setContent("118 minutes");
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
	startVideo: function() {

	},
	clickPlay: function() {
    this.$.videoToast.open();
    var video = this.createComponent({kind: "PlexViewVideo", pmo: this.plexMediaObject});
    video.playVideo();
        //this.$.videoView.setVisible(true);
		//this.$.videoView.playVideo();
		//video.playVideo();
		//this.$.video.node.webkitEnterFullscreen();
		//this.$.video.setSrc("http://saturnus.mine.nu:32400/video/:/transcode/segmented/start.m3u8?url=http%3A%2F%2Fsaturnus.mine.nu%3A32400%2Flibrary%2Fparts%2F3395%2Ffile.avi&ratingKey=3492&identifier=com.plexapp.plugins.library&key=http%3A%2F%2Fsaturnus.mine.nu%3A32400%2Flibrary%2Fmetadata%2F3492&session=a83b42e021f2c7f9d3876c8797f6c0b1ede47d8c&quality=5&3g=0");
		
		//this.$.video.play();
	}
})
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
  		{kind: enyo.HFlexBox, className: "enyo-fit", components: [
    		{kind: enyo.VFlexBox, pack: "start", style: "margin: 10px;", components: [
    			{className: "cover", onclick: "startVideo",components: [
    		    {name: "thumb", kind: "Image", className: "thumb"},
    		    /*{kind: "PlexViewVideo", name: "videoView", visible: false, className: "thumb"},*/
    		  ]},
    		]}, //cover box
        {kind: enyo.VFlexBox, pack: "start", flex: 1, style: "margin: 10px;",name:"details",components: [
              {kind: enyo.HFlexBox, className: "title_holder", components: [
                {name: "title", className: "title"},
                {name: "pgRating", kind: "Image"},        
              ]},//title,pgrating
              {kind: enyo.HFlexBox, components: [
                {name: "released", className: "info_text", content: "Released 2009-11-11"},
                {content: "-", style: "margin-left: 5px; margin-right: 5px; color: #888;"},
                {name: "runtime", className: "info_text", content: "118 minutes"},
                {content: "-", style: "margin-left: 5px; margin-right: 5px; color: #888;"},
                {name: "category", className: "info_text", content: "Sci-fi"},
              ]}, //released, runtime, category
              {name: "desc", className: "desc"},
              {kind: enyo.VFlexBox, pack:"end", components:[
                {kind: enyo.HFlexBox, components: [
                  {content: "Director: ", className: "details-header"},
                  {name: "directors"},
                ]},              
                {kind: enyo.HFlexBox, components: [
                  {content: "Writer: ", className: "details-header"},
                  {name: "writers"},
                ]},
                {kind: enyo.HFlexBox, components: [
                  {content: "Cast: ", className: "details-header"},
                  {name: "cast"},
                ]},
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
  /*	{kind: "Toaster", name: "videoToast", style: "top: 0px;width: 1024px;height: 768px",flyInFrom: "right", components: [ 
  	  {name: "videoPlayer", kind: "PlexViewVideo", flex:1},
  	]},*/
  	//{name: "videoPlayer", kind: "PlexViewVideo", flex:1, style: "top: 0px;width: 1024px;height: 768px", lazy: true, showing: false},
	],
	create: function() {
		this.inherited(arguments);
		this.plexMediaObjectChanged();
	},
	plexMediaObjectChanged: function() {
		if (this.plexMediaObject !== undefined) {
		  //this.$.videoView.setPmo(this.plexMediaObject);
			this.log("preplay with: " + enyo.json.stringify(this.plexMediaObject));
			this.$.thumb.setSrc(this.server.baseUrl + this.plexMediaObject.thumb);
			this.$.title.setContent(this.plexMediaObject.title);
			this.$.released.setContent(this.plexMediaObject.year);

      //duration
			if (this.plexMediaObject.Media !== undefined)
			  this.$.runtime.setContent(this.plexMediaObject.Media.duration / 3600);
			else {
			  this.$.runtime.setContent("");
			}
			//this.$.tagline.setContent(this.plexMediaObject.tagline);

			//collect directors
			var directors = this.collectTags(this.plexMediaObject.Director);
		  this.$.directors.createComponent({content: directors, className: "info_text"});

			//collect writers		  
		  var writers = this.collectTags(this.plexMediaObject.Writer);
		  this.$.writers.createComponent({content: writers, className: "info_text"});

			//collect cast
      var cast = this.collectTags(this.plexMediaObject.Role);
      this.$.cast.createComponent({content: cast, className: "info_text"});
		  
			this.$.category.setContent("Sci-fi");
			this.$.runtime.setContent("118 minutes");
			this.$.desc.setContent(this.plexMediaObject.summary);
			//this.$.video.setSrc(this.server.baseUrl + this.plexMediaObject.Media.Part.key);
			
			//this.$.thumb.setSrc("images/BlankPoster.png");
			this.$.backdropImg.setSrc(this.server.baseUrl + this.plexMediaObject.art);

			//finally render the shit out of this...
			this.render();
		}
	},
	transcoderUrlForVideoObject: function() {
	  var transcodingUrl = window.PlexReq.transcodeUrlForVideoUrl(this.plexMediaObject,this.server, this.plexMediaObject.Media.Part.key);
	  this.log(transcodingUrl);
	  return transcodingUrl;
	},
	collectTags: function (tagContainer) {
	  var tags = "";
	  if (tagContainer !== undefined) {
  	  for (var i = 0; i < tagContainer.length; i++) {
    	  if (tags !== "")
    	    tags += ", ";
    	  tags += tagContainer[i].tag;
    	}
  	}
  	return tags;
	},
	doClose: function() {
		this.close();
	},
	startVideo: function() {

	},
	clickPlay: function() {
    var videoSrc = this.transcoderUrlForVideoObject();

    this.owner.owner.startVideoPlayer(videoSrc,this.plexMediaObject, this.server);
  }
})
enyo.kind({
	name: "plex.PreplayView", 
  kind: enyo.VFlexBox,
  dragAnywhere: false,
  className: "enyo-fit",
  /*style: "border: 1px solid red;",*/
	published: {
		plexMediaObject: undefined,
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
    			{className: "cover", onclick: "clickPlay",components: [
            {name: "playBtn",className: "overlay-play-button"},
    		    {name: "thumb", kind: "Image", className: "thumb"},
    		    /*{kind: "PlexViewVideo", name: "videoView", visible: false, className: "thumb"},*/
            {kind: enyo.VFlexBox,pack:"center",align:"center",components: [
              {kind: enyo.HFlexBox, className:"rating_holder", components: [
                {name: "rating_1", kind: "Image", className: "star_1"},
                {name: "rating_2", kind: "Image", className: "star_2"},
                {name: "rating_3", kind: "Image", className: "star_3"},
                {name: "rating_4", kind: "Image", className: "star_4"},
                {name: "rating_5", kind: "Image", className: "star_5"},  
              ]},
              {name: "studioImg", kind: "Image", height: "80px", width: "80px"},
            ]},
    		  ]},
    		]}, //cover box
        {kind: enyo.VFlexBox, pack: "start", flex: 1, style: "margin: 10px;",name:"details",components: [
              {kind: enyo.HFlexBox, className: "title_holder",pack:"start", align: "center",components: [
                {name: "title", className: "title"},
                {kind: enyo.VFlexBox, pack:"center",height: "45px", align:"center", components:[
                  {name: "pgRating", kind: "Image"},
                ]}
                
              ]},//title,pgrating
              {name: "desc", className: "desc"},
              {kind: "Spacer", style:"min-height: 25px;"},
              {kind: enyo.VFlexBox, pack:"end", components:[
                {kind: enyo.HFlexBox, align: "baseline", components: [
                  {content: "Director: ", className: "details-header"},
                  {name: "directors", className: "desc"},
                ]},              
                {kind: enyo.HFlexBox, align: "baseline", components: [
                  {content: "Writer: ", className: "details-header"},
                  {name: "writers", className: "desc"},
                ]},
                {kind: enyo.HFlexBox, align: "baseline", components: [
                  {content: "Cast: ", className: "details-header"},
                  {name: "cast", className: "desc"},
                ]},
              ]},
        ]}, //descr box
  		]},
		
		]}, //scroller end
    { name: "resumeDialog", onResume: "resumeVideoHandler", onFromStart: "fromStartVideoHandler", kind: "plex.ResumeDialog",  width: "400px", message: $L("It looks like you have already watched a part of this video.\r\n\r\nWould you like to resume from where you left off, or play from the start?") },
		{kind: "Toolbar", align: "center", components: [
  		{name: "dragHandle", kind: "GrabButton", onclick: "closeMyself", slidingHandler: true},
                    {kind: enyo.HFlexBox, components: [
                {name: "released", className: "info_text", content: "Released 2009-11-11"},
                {name: "runtime", className: "info_text", content: "118 minutes"},
                {name: "category", className: "info_text", content: "Sci-fi"},
              ]}, //released, runtime, category
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
			//this.log("preplay with: " + enyo.json.stringify(this.plexMediaObject));
      var thumbUrl = window.PlexReq.getImageTranscodeUrl(this.server,194,273,this.plexMediaObject.thumb);
			this.$.thumb.setSrc(thumbUrl);
			this.$.title.setContent(this.plexMediaObject.title);
			this.$.released.setContent(this.plexMediaObject.year);
      var genre = this.collectTags(this.plexMediaObject.Genre);
      this.$.category.setContent(genre);

      //flag images
      if (this.plexMediaObject.studio !== undefined) {
        var studioFlagUrl = window.PlexReq.getStudioFlag(this.plexMediaObject.studio);
        var studioImgUrl = window.PlexReq.getImageTranscodeUrl(this.server,80,80,studioFlagUrl);
        this.$.studioImg.setSrc(studioImgUrl);
      }
      if (this.plexMediaObject.contentRating !== undefined) {
        var ratingFlagUrl = window.PlexReq.getContentRatingFlag(this.plexMediaObject.contentRating);
        var ratingImgUrl = window.PlexReq.getImageTranscodeUrl(this.server,40,40,ratingFlagUrl);
        this.$.pgRating.setSrc(ratingImgUrl);
      }
 
      //rating
      if (this.plexMediaObject.rating){
        this.calculateRating();
      }
      //duration
			if (this.plexMediaObject.Media !== undefined) {
        var runtimeCaption = this.runtimeForDisplay(this.plexMediaObject.Media.duration);

			  this.$.runtime.setContent(runtimeCaption);
      }
			else {
			  this.$.runtime.setContent("");
			}
			//this.$.tagline.setContent(this.plexMediaObject.tagline);

			//collect directors
			var directors = this.collectTags(this.plexMediaObject.Director);
		  this.$.directors.setContent(directors);

			//collect writers		  
		  var writers = this.collectTags(this.plexMediaObject.Writer);
      this.$.writers.setContent(writers);

			//collect cast
      var cast = this.collectTags(this.plexMediaObject.Role);
      this.$.cast.setContent(cast);
		  
			

			this.$.desc.setContent(this.plexMediaObject.summary);
			//this.$.video.setSrc(this.server.baseUrl + this.plexMediaObject.Media.Part.key);
			
			//this.$.thumb.setSrc("images/BlankPoster.png");
      var backdropUrl = window.PlexReq.getImageTranscodeUrl(this.server,1280,720,this.plexMediaObject.art);
			this.$.backdropImg.setSrc(backdropUrl);

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
  calculateRating: function() {
    if (parseInt(this.plexMediaObject.rating) > 9) {
      this.$.rating_1.setSrc("images/star_full.png");
      this.$.rating_2.setSrc("images/star_full.png");
      this.$.rating_3.setSrc("images/star_full.png");
      this.$.rating_4.setSrc("images/star_full.png");
      this.$.rating_5.setSrc("images/star_full.png");
    }
    else if (parseInt(this.plexMediaObject.rating) > 8) {
      this.$.rating_1.setSrc("images/star_full.png");
      this.$.rating_2.setSrc("images/star_full.png");
      this.$.rating_3.setSrc("images/star_full.png");
      this.$.rating_4.setSrc("images/star_full.png");
      this.$.rating_5.setSrc("images/star_half.png");
    }
    else if (parseInt(this.plexMediaObject.rating) > 6){
      this.$.rating_1.setSrc("images/star_full.png");
      this.$.rating_2.setSrc("images/star_full.png");
      this.$.rating_3.setSrc("images/star_half.png");
      this.$.rating_4.setSrc("images/star_empty.png");
      this.$.rating_5.setSrc("images/star_empty.png");   
    }
    else if (parseInt(this.plexMediaObject.rating) > 4) {
      this.$.rating_1.setSrc("images/star_full.png");
      this.$.rating_2.setSrc("images/star_full.png");
      this.$.rating_3.setSrc("images/star_empty.png");
      this.$.rating_4.setSrc("images/star_empty.png");
      this.$.rating_5.setSrc("images/star_empty.png");      
    }
    else if (parseInt(this.plexMediaObject.rating) > 2) {
      this.$.rating_1.setSrc("images/star_full.png");
      this.$.rating_2.setSrc("images/star_empty.png");
      this.$.rating_3.setSrc("images/star_empty.png");
      this.$.rating_4.setSrc("images/star_empty.png");
      this.$.rating_5.setSrc("images/star_empty.png");      
    }
    else if (parseInt(this.plexMediaObject.rating) > 0) {
      this.$.rating_1.setSrc("images/star_half.png");
      this.$.rating_2.setSrc("images/star_empty.png");
      this.$.rating_3.setSrc("images/star_empty.png");
      this.$.rating_4.setSrc("images/star_empty.png");
      this.$.rating_5.setSrc("images/star_empty.png");      
    }
  },
  runtimeForDisplay: function(duration) {
    var x = duration / 1000;
    var secs = Math.floor(x % 60);
    x /= 60;
    var mins = Math.floor(x % 60);
    x /= 60;
    var hrs = Math.floor(x % 24);
    var finalCaption = "";
    if (hrs > 0) {
      finalCaption += hrs + " hrs ";
    }
    if (mins > 0) {
      finalCaption += mins + " mins";
    }
    return finalCaption;
  },
	doClose: function() {
		this.close();
	},
	startVideo: function() {

	},
	clickPlay: function() {
    if (this.plexMediaObject.viewOffset) {
      this.$.resumeDialog.setResumeOffset(this.plexMediaObject.viewOffset);  
      this.$.resumeDialog.openAtCenter();
    }
    else {
      this.fromStartVideoHandler();
    }
    
  },
  resumeVideoHandler: function() {
    var transcodingUrl = window.PlexReq.transcodeUrlForVideoUrl(this.plexMediaObject,this.server, this.plexMediaObject.Media.Part.key, true);

    this.owner.owner.startVideoPlayer(transcodingUrl,this.plexMediaObject, this.server, true);    
  },
  fromStartVideoHandler: function() {
    var transcodingUrl = window.PlexReq.transcodeUrlForVideoUrl(this.plexMediaObject,this.server, this.plexMediaObject.Media.Part.key, false);

    this.owner.owner.startVideoPlayer(transcodingUrl,this.plexMediaObject, this.server, false);    
  },
})
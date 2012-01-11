enyo.kind({
	name: "plex.ArtistView", 
  kind: enyo.VFlexBox,
  className: "enyo-fit",
	published: {
		plexMediaObject: undefined,
		server: undefined,
	},
	components: [
      {name: "backdrop", className: "backdrop", components: [
        {name: "backdropImg", kind: "Image", className: "backdrop-img"},
      ]},
		  {className: "enyo-sliding-view-shadow"},
      {kind: enyo.Scroller, flex: 1, autoHorizontal: false, horizontal: false, accelerated: true, fpsShowing: true, components: [ 
      {kind: enyo.VFlexBox, style: "margin: 10px;",className: "enyo-fit", components: [      
				{kind: enyo.VFlexBox, components: [
				  {kind: enyo.HFlexBox, className: "artist-title_holder", components: [
				    {name: "title", className: "artist-title"},
				  ]},
          {kind: "enyo.DividerDrawer", caption: "Biography", open: false, components:[
            {name: "desc", className: "artist-desc"},
          ]},
				]}, //title + desc
		    {name: "cells", kind: enyo.VFlexBox, style: "min-height: 100%; height: 100%"},
      ]},
    ]},
    {kind: "Toolbar", components: [
      {name: "dragHandle", kind: "GrabButton", onclick: "closeMyself"},
        {kind: enyo.HFlexBox, components: [
          {name: "genre", className: "info_text", content: "Heavy metal"},
        ]}, //genre
    ]},
	],
	create: function() {
		this.inherited(arguments);
		this.albums = [];
		this.plexMediaObjectChanged();
	},
	plexMediaObjectChanged: function() {
		if (this.plexMediaObject != undefined) {
      var backdropUrl = window.PlexReq.getImageTranscodeUrl(this.server,1280,720,this.plexMediaObject.thumb);
      this.$.backdropImg.setSrc(backdropUrl);

			this.$.title.setContent(this.plexMediaObject.title);
			this.$.desc.setContent(this.plexMediaObject.summary);

      var genre = this.collectTags(this.plexMediaObject.Genre);
      this.$.genre.setContent(genre);
      			  		
  		//get them albums now
			window.PlexReq.setCallback(enyo.bind(this,"gotAlbums"));
			window.PlexReq.dataForUrlAsync(this.server,this.plexMediaObject.key);
		}
	},
	gotAlbums: function(pmc) {
		//reset the album list
		this.$.cells.destroyControls();
		
	  if (pmc.Directory != undefined || pmc.Directory.length > 0) {
	  
	    if (enyo.isArray(pmc.Directory))
	      this.albums = pmc.Directory;
      else
        this.albums[0] = pmc.Directory;
      
      for (var i=0; i < this.albums.length; i++){
      	var album = this.albums[i];
      	window.PlexReq.setCallback(enyo.bind(this,"gotSongs"));
      	window.PlexReq.dataForUrlAsync(this.server,album.key);
      	this.log("requested songlist for: " + album.title);
      }

	    this.render();
	  }
	},
	buildAlbum: function(pmo) {
		if (pmo !== undefined && !pmo.mixedParents && (pmo.viewGroup == "track" || pmo.viewGroup == "episode")){
			var c = this.$.cells.createComponent({kind: "plex.AlbumView", plexMediaObject: pmo, server: this.server});
			this.log("built album: " + pmo.parentTitle);
		}
		
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
	gotSongs: function(pmo) {
			this.buildAlbum(pmo);
			this.$.cells.render();
	},
  showMoreDesc: function() {
    this.$.desc.applyStyle("height: 100%");
    this.$.showMore.setCaption($L("Show less"));
  },
  closeMyself: function(inSender, inEvent) {
    this.parent.owner.close(); //should be the toaster
  },
})
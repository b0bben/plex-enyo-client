enyo.kind({
	name: "plex.ArtistView", 
  kind: enyo.Control,
  className: "enyo-fit enyo-bg",
	published: {
		plexMediaObject: undefined,
	},
	components: [
		  
      {kind: "Scroller", flex: 1, style: "min-height: 100%;", autoHorizontal: false, horizontal: false, components: [ 
      {kind: enyo.VFlexBox, components: [      
        {kind: enyo.HFlexBox, components: [
          {className: "artist-cover", components: [
  				  {name: "thumb", kind: "Image", className: "artist-thumb"},
  				]},
  				{kind: enyo.VFlexBox, components: [
  				  {kind: enyo.HFlexBox, className: "artist-title_holder", components: [
  				    {name: "title", className: "artist-title"},
  				  ]},
   				  {name: "desc", className: "artist-desc"},
  				]},
        ]},
			{name: "cells", kind: enyo.VFlexBox, style: "min-height: 100%; height: 100%"},
      ]},
    ]}
	],
	create: function() {
		this.inherited(arguments);
		this.albums = [];
		this.plexReq = new PlexRequest();
		this.plexMediaObjectChanged();
	},
	plexMediaObjectChanged: function() {
		if (this.plexMediaObject != undefined) {
			this.log("artist with: " + this.plexMediaObject.title);
			this.$.thumb.setSrc(this.plexReq.baseUrl + this.plexMediaObject.thumb);
			this.$.title.setContent(this.plexMediaObject.title);
			this.$.desc.setContent(this.plexMediaObject.summary);
  		
  		//get them albums now
			this.plexReq = new PlexRequest(enyo.bind(this,"gotAlbums"));
			this.plexReq.dataForUrl(this.plexMediaObject.key);
		}
	},
	gotAlbums: function(pmc) {
		//reset the album list
		this.$.cells.destroyComponents();
		
	  if (pmc.Directory != undefined || pmc.Directory.length > 0) {
	  
	    if (enyo.isArray(pmc.Directory))
	      this.albums = pmc.Directory;
      else
        this.albums[0] = pmc.Directory;
      
      for (var i=0; i < this.albums.length; i++){
      	var album = this.albums[i];
      	this.plexReq = new PlexRequest(enyo.bind(this,"gotSongs"));
      	this.plexReq.dataForUrl(album.key);
      	this.log("requested songlist for: " + album.title);
      }

	    this.render();
	  }
	},
	buildAlbum: function(pmo) {
		if (pmo !== undefined && pmo.viewGroup == "track" && !pmo.mixedParents){
			var c = this.$.cells.createComponent({kind: "plex.AlbumView", plexMediaObject: pmo});
			this.log("built album: " + pmo.parentTitle);
		}
		
	},
	gotSongs: function(pmo) {
			this.buildAlbum(pmo);
			this.$.cells.render();
	},
})
enyo.kind({
	name: "plex.ArtistView", 
  kind: enyo.VFlexBox,
  className: "enyo-fit",
	published: {
		plexMediaObject: "",
	},
	components: [
		{kind: enyo.Scroller, flex: 1,components: [
      {kind: enyo.HFlexBox, width: "100%", flex: 2, components: [
        {className: "artist-cover", components: [
				  {name: "thumb", kind: "Image", className: "artist-thumb"},
				]},
        {kind: enyo.HFlexBox, className: "artist-title_holder", components: [
          {name: "title", className: "artist-title"},
        ]},
        {name: "desc", className: "artist-desc"},
      ]},
      {name: "albumList", kind: "VirtualList", className: "album-list", onSetupRow: "getItem", components: [
        {name: "cells", kind: "VFlexBox"}
      ]},
		]},
		{kind: "Toolbar", components: [
	    {kind: "GrabButton"},
    ]}

	],
	create: function() {
		this.inherited(arguments);
		this.plexReq = new PlexRequest();
		this.plexMediaObjectChanged();
		this.albums = [];
	},
	plexMediaObjectChanged: function() {
		if (this.plexMediaObject != undefined) {
			this.log("artist with: " + this.plexMediaObject.title);
			this.$.thumb.setSrc(this.plexReq.baseUrl + this.plexMediaObject.thumb);
			this.$.title.setContent(this.plexMediaObject.title);
			this.$.desc.setContent(this.plexMediaObject.summary);
			this.plexReq = new PlexRequest(enyo.bind(this,"gotAlbums"));
			this.plexReq.dataForUrl(this.plexMediaObject.key);
		}
	},
	getItem: function(inSender, inIndex) {
	    if (this.albums.length > 0 && inIndex < this.albums.length) {
          var album = this.albums[inIndex];
          if (album != undefined && album.type == "album") {
            this.$.albumView.setPlexMediaObject(album);
            return true;
          }
	        
	    }
	},
	gotAlbums: function(pmc) {
	  if (pmc.Directory != undefined || pmc.Directory.length > 0) {
	  
	    if (enyo.isArray(pmc.Directory))
	      this.albums = pmc.Directory;
      else
        this.albums[0] = pmc.Directory;
        
	    this.buildAlbums();
	    
	  }
	},
	buildAlbums: function() {
		this.$.cells.destroyControls();
		this.cells = [];
		for (var i=0; i<this.albums.length; i++) {
			var c = this.$.cells.createComponent({kind: "plex.AlbumView", plexMediaObject: this.albums[i], owner:this});
			this.cells.push(c);
		}
		this.$.albumList.refresh();
	},
	
})
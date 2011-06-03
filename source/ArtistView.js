enyo.kind({
	name: "plex.ArtistView", 
  kind: enyo.Control,
  className: "enyo-fit",
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
        
        {name: "albumList", kind: "VirtualRepeater", flex: 1, onSetupRow: "getItem", components: [
          {kind: "Item", layoutKind: "VFlexLayout", className: "item", components: [
            {name: "cells", kind: enyo.VFlexBox}
          ]},
        ]},
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
			this.plexReq = new PlexRequest(enyo.bind(this,"gotAlbums"));
			this.plexReq.dataForUrl(this.plexMediaObject.key);
		}
	},
	getItem: function(inSender, inIndex) {
    if (inIndex < this.albums.length) {
    	this.$.albumView.setPlexMediaObject(this.albums[inIndex]);
    	return true;
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
			var c = this.$.cells.createComponent({kind: "plex.AlbumView", owner:this});
			this.cells.push(c);
			this.log("built album: " + this.albums[i].title);
		}
		this.$.albumList.render();
	},
	
})
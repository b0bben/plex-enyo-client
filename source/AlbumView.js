enyo.kind({
	name: "plex.AlbumView", 
  kind: enyo.VFlexBox,
	published: {
		plexMediaObject: undefined,
	},
	components: [
	  {name: "album-title-holder", className: "album-title-container", components: [
	    {name: "title", className: "album-title"}
	  ]},
	  {kind: enyo.HFlexBox, components: [
      {name: "cover", kind: enyo.Image, className: "album-cover"},
      {name: "tracklist", kind: "plex.SongList", flex: 1},
	  ]}
	],
	create: function() {
		this.inherited(arguments);
		this.plexReq = new PlexRequest();
		this.plexMediaObjectChanged();
	},
	plexMediaObjectChanged: function() {
		if (this.plexMediaObject != undefined) {
			this.log("albumview with: " + this.plexMediaObject.title);
			this.$.cover.setSrc(this.plexReq.baseUrl + this.plexMediaObject.thumb);
			this.$.title.setContent(this.plexMediaObject.title);

      this.$.tracklist.setPlexMediaObject(this.plexMediaObject);
		}
	},
})
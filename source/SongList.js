enyo.kind({
  name: "plex.SongList", 
	kind: enyo.Control,
  published: {
  	plexMediaObject: undefined,
  },
  components: [
    {kind:enyo.VFlexBox, components: [
      {content: "testing testing"},
      {name: "trackList", kind: "VirtualList", flex: 1, onSetupRow: "setupRowItems", components: [ 
        {name:"itemSong", kind: "Item", layoutKind:"HFlexLayout", className:'song', onmousehold: "itemMousehold", onmouserelease: "itemMouserelease", onclick: "onclick_song", ondragstart: "itemDragStart", ondragfinish: "itemDragFinish", ondrag: "onDrag_itemMedia", ondrop: "onDrop_itemMedia", components: [
      	  {name: "songNumber", content: '1'},
      	  {name: "songTitle", flex: 2, content: "The way of the fist"}, 
      	  {name: "songDuration", flex: 1, content: "3:45"}
      	]},
      ]},
    
    ]},
	],
	create: function() {
		this.inherited(arguments);
		this.tracks = [];
		this.playing = false;
		this.plexMediaObjectChanged();
	},
	plexMediaObjectChanged: function() {
		if (this.plexMediaObject != undefined) {
      window.PlexReq.setCallback(enyo.bind(this,"gotSongs"));
      window.PlexReq.dataForUrl(this.plexMediaObject.key);
			this.log("songlist for: " + this.plexMediaObject.title);
		}
	},
	gotSongs: function(pmc) {
	  if (pmc.Track != undefined || pmc.Track.length > 0) {
	    this.log("got songs");
	    
	    if (enyo.isArray(pmc.Track))
	      this.tracks = pmc.Track;
	    else
	      this.tracks[0] = pmc.Track;

      //this.$.trackList.render();
	    this.$.trackList.refresh();
	  }
	},
	onclick_song: function(inSender, inEvent) {
	  var songItem = this.tracks[inEvent.rowIndex];
	  if (songItem !== undefined && !this.playing) {
	    this.$.sound.setSrc(window.PlexReq.getFullUrlForPlexUrl(songItem.Media.Part.key));
	    this.$.sound.play();
	    this.playing = true;
	  }
	  else if (this.$.sound.audio.playbackrate > 0) {
	    this.$.sound.audio.pause();
	    this.playing = false;
	  }
	},
	setupRowItems: function (sender, intIndex)	{
			try
			{
				this.log("creating song with index: " + intIndex);
				
				//intIndex = intIndex  + this.intJumpRowOffset;
	
				if(this.tracks !== undefined)
				{				
					if(this.tracks[intIndex] !== undefined)
					{
					  var track = this.tracks[intIndex];
						//this.log("title: " + this.arSongs[intIndex].title);
						//this.log(this.arSongs[intIndex].title);
						var secs = Math.floor(track.duration / 1000);
						var mins = Math.floor(secs / 60);
						secs = secs % 60;
						
						this.$.songNumber.content = track.index;
						this.$.songNumber.setStyle("width: " + (this.tracks.length+'').length * 0.8 + "em");
						this.$.songTitle.content = track.title;
						this.$.songDuration.content = mins + ":" + secs;
						
						//if (this.arSongs[intIndex].origIndex === this.intCurrTrackOrigIndex) Discontinued use of origIndex to match for highlight
						
						//this.$.itemMedia.addRemoveClass("playing", (this.arSongs[intIndex]._id === this.strCurrTrackID));
						//this.$.itemMedia.addRemoveClass("odd", (intIndex % 2 === 0 ));
						this.log("finshed")
						//this.$.itemMedia.setContent("-----");
						return true
					}
				//return true;
				}
	
		
			}
			catch(err)
			{
				this.log("error: " + err)
			}		
			
			return false;	
	
		},
})
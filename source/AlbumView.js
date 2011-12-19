enyo.kind({
	name: "plex.AlbumView", 
	kind: enyo.VFlexBox,
	published: {
		plexMediaObject: undefined,
		server: undefined,
	},
	components: [
	  {name: "album-title-holder", className: "album-title-container", components: [
	    {name: "title", className: "album-title"}
	  ]},
	  {name: "trackContainer", kind: enyo.HFlexBox, components: [
      {name: "cover", kind: enyo.Image},
      {kind: enyo.VFlexBox, flex: 1,style: "min-height:100%", components: [  
        {name: "trackList", kind: "VirtualRepeater", onSetupRow: "setupRowItems", components: [ 
          {name:"itemSong", kind: "Item", layoutKind:"HFlexLayout", className:'song', onmousehold: "itemMousehold", onmouserelease: "itemMouserelease", onclick: "onclick_song", ondragstart: "itemDragStart", ondragfinish: "itemDragFinish", ondrag: "onDrag_itemMedia", ondrop: "onDrop_itemMedia", components: [
        	  {name: "songNumber", content: '1'},
        	  {name: "songTitle", flex: 7, content: "The way of the fist", className: "song-title"}, 
        	  {name: "songDuration", flex: 1, content: "3:45"}
        	]},
      	]},
      ]},
	  ]}
	],
	create: function() {
		this.inherited(arguments);
		this.tracks = [];
		this.playing = false;
		this.plexReq = new PlexRequest();
		this.plexMediaObjectChanged();
	},
	plexMediaObjectChanged: function() {
		if (this.plexMediaObject !== undefined && (this.plexMediaObject.viewGroup == "track" || this.plexMediaObject.viewGroup == "episode")) {
			//set the general info for the album
			this.log("albumview with: " + this.plexMediaObject.parentTitle);
			this.$.cover.setSrc(this.server.baseUrl + this.plexMediaObject.thumb);
			this.$.cover.addRemoveClass("album-cover-shows",this.plexMediaObject.viewGroup === "episode");
			this.$.cover.addRemoveClass("album-cover-album",this.plexMediaObject.viewGroup === "track");
			
			if (this.plexMediaObject.viewGroup === "episode")
				this.$.title.setContent(this.plexMediaObject.title2);
			else if (this.plexMediaObject.viewGroup === "track")
				this.$.title.setContent(this.plexMediaObject.parentTitle);


			
			if (this.plexMediaObject.viewGroup === "track") {
				//construct the track listing
				this.createTrackList(this.plexMediaObject);				
			}
			else if (this.plexMediaObject.viewGroup === "episode") {
				//construct the track listing
				this.createEpisodeList(this.plexMediaObject);
			}
			//gogogogogo!
			//this.render();
			this.$.trackList.render();
		}
	},
	tracksChanged: function() {
		this.$.trackList.render();
	},
	createEpisodeList: function(pmc) {
		  if (pmc.Video !== undefined || pmc.Video.length > 0) {
		    this.log();
		    
		    if (enyo.isArray(pmc.Video))
		      this.tracks = pmc.Video;
		    else
		      this.tracks[0] = pmc.Video;
		  }
	},
	createTrackList: function(pmc) {
		  if (pmc.Track !== undefined || pmc.Track.length > 0) {
		    this.log();
		    
		    if (enyo.isArray(pmc.Track))
		      this.tracks = pmc.Track;
		    else
		      this.tracks[0] = pmc.Track;
		  }
	},
		onclick_song: function(inSender, inEvent) {
		  var songItem = this.tracks[inEvent.rowIndex];
		  if (songItem !== undefined && !this.playing) {
		  	this.owner.owner.owner.owner.startMusicPlayback(songItem, null);
		    //this.$.sound.setSrc(this.plexReq.getFullUrlForPlexUrl(this.server,songItem.Media.Part.key));
		    //this.$.sound.play();
		    this.playing = true;
		  }
		  else if (this.playing) {
		    //this.$.sound.audio.pause();
		    this.playing = false;
		  }
		},
		setupRowItems: function (sender, intIndex)	{
				try
				{
					
					
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
							if (secs <= 9)
							  secs = "0" + secs; //formating minutes to :00 format
							  
							this.$.songNumber.content = track.index;
							this.$.songNumber.setStyle("width: " + (this.tracks.length+'').length * 0.8 + "em");
							this.$.songTitle.content = track.title;
							this.$.songDuration.content = mins + ":" + secs;
							
							//if (this.arSongs[intIndex].origIndex === this.intCurrTrackOrigIndex) Discontinued use of origIndex to match for highlight
							
							//this.$.itemMedia.addRemoveClass("playing", (this.arSongs[intIndex]._id === this.strCurrTrackID));
							//this.$.itemMedia.addRemoveClass("odd", (intIndex % 2 === 0 ));
							this.log("created song: " + track.title);
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
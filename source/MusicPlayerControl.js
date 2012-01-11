enyo.kind({
	kind: "Header",
	name: "plex.MusicPlayerControl",
	height: "80px",
	className: "enyo-toolbar enyo-hflexbox controls",
	events: {
		onClickPrev: "",
		onClickPlayPause: "",
		onClickNext: "",
		onShuffleClick: "",
		onRepeatClick: "",
		onSetVolume: "",
		onRequestVolume: "",
		onSetPlaybackTime: "",
		onClickFullScreen: ""
	},
	published: {playEnabled: false, prevNextEnabled: false, trackInfo: undefined},
	components: [
			{kind: "Sound", audioClass: "media"},
			{kind: "Control", className: "playback", layoutKind: "HFlexLayout", pack: "start", align: "center", components: [
				{name: "btnPrev", kind: "IconButton", className: "prev", icon:"images/btn_controls_prev.png", onclick: "onclick_prev", disabled: true}, // This needs to be changed to switch icons like btnPlay
				{name: "btnPlay", kind: "IconButton", className: "play paused", icon:"images/btn_controls_play.png", label: " ", onclick: "onclick_playpause", disabled: true},
				{name: "btnNext", kind: "IconButton", className: "next", icon:"images/btn_controls_next.png", onclick: "onclick_next", disabled: true} // This needs to be changed to switch icons like btnPlay
			]},
			{kind: "Spacer", style:"max-width:25px;"},
			{kind: "Control", flex:1, layoutKind: "VFlexLayout", align: "center", pack:"justify", components: [
				{kind: "HFlexBox", align: "center", className: "current", pack: "justify", components: [
					{name: "btnRepeat", kind: "Control", className: "toggleMode repeat", onclick: "doRepeatClick"}, //possible class values are off/on/one - let me know if switching classes is harder than say... set styles
					{kind: "Control", pack:"justify", align: "center", flex:1, className: "info", components: [
						{name: "lblArtistName", content: "", className: "artist"},
						{name: "lblSongTitle", content: "", className: "title"}
					]},
					{name: "btnShuffle", kind: "Control", className: "toggleMode shuffle", onclick:"doShuffleClick"} //possible class values are off/on - let me know if switching classes is harder than say... set styles
					
				]},
				{kind: "Control", layoutKind: "HFlexLayout", className: "progress", pack: "center", components: [  						//JC_UI
					{name: "lblSongTime", kind: "Control", className: "label elapsed", content: "--:--"},
					{name: "sliderSongTime", kind: "ProgressSlider", onChange: "onChange_sliderSongTime", onChanging: "onChanging_sliderSongTime", onclick: "onClick_sliderSongTime", tapPosition: true, lockBar: true, position:0, flex:1, disabled: true},
					{name: "lblSongDuration", kind: "Control", className: "label duration", content: "--:--"},
				]}
			]},
			{kind: "Spacer", style:"max-width:15px;"},
			/*
			{kind: "Control", layoutKind: "VFlexLayout", pack: "justify", width:"190px", align: "end", components:[						//JC_UI
				{name: "btnFullscreen", kind: "Control", className: "toggleMode fullscreen", onclick: "onclick_FullScreen"},
			*/
			{kind: "Control", width:"190px", height: "64px", style: "overflow: hidden;", align: "end", components:[						//JC_UI
				{name: "btnFullscreen", kind: "Control", style: "position: relative; left: 140px;", className: "toggleMode fullscreen", onclick: "onclick_FullScreen"},				
				{name: "sliderVolume", kind: "ProgressSlider", lockBar: true, position:0, width:"142px", className: "volume", onChange: "onChange_sliderVolume", onChanging: "onChanging_sliderVolume"}
			]}
	],
	
	
	
	_boolUpdateSlider: true,
	_boolUpdateTimeDisplay: true,	
	_boolUpdateVolumeSlider: true,
	
	_intCurrentDuration: 0,
	
	
	create: function ()
	{
		this.inherited(arguments);
		
		this.doRequestVolume(enyo.bind(this,this.onGetVolume));

		this.$.sound.audio.addEventListener('load', enyo.bind(this, this.onAudioLoaded), false);
		this.$.sound.audio.addEventListener('play', enyo.bind(this, this.onAudioPlayed), false);
		this.$.sound.audio.addEventListener('playing', enyo.bind(this, this.onAudioPlaying), false);
		this.$.sound.audio.addEventListener('ended', enyo.bind(this, this.onAudioEnded), false);
		this.$.sound.audio.addEventListener('pause', enyo.bind(this, this.onAudioPaused), false);
		
		this.$.sound.audio.addEventListener('error', enyo.bind(this, this.onError_Play), false);
		this.$.sound.audio.addEventListener('stalled', enyo.bind(this, this.onError_Stall), false);
	},
	
	trackInfoChanged: function() {
		if (this.boolAudioPlaying) {
			this.onclick_playpause();
		}
		if (this.trackInfo) {
			this.updateTrackInfoDisplay();
			var server = this.trackInfo.server;
			var song = this.trackInfo.context.Track[this.trackInfo.intTrackIndex-1];
			var songUrl = window.PlexReq.getAssetUrl(server,song.Media.Part.key);
			this.$.sound.setSrc(songUrl);
			
			this.$.sound.play();
			this.playedIntervalId = setInterval(enyo.bind(this,"updateTrackTimes"), 1000);
		}
	},

	updateTrackTimes: function ()
	{
		//console.log("updateTrackTime");
		//this.$.sliderSongTime.setPositionImmediate(intBarPos);
		//this.$.sliderSongTime.barPosition = intBarPos;
		if(!this.boolSuspendUpdates)
		{
			var objTrackTimes = {floatTrackCurrentTime: this.getTrackCurrentTime(), floatTrackDuration: this.getTrackDuration()};
			this.updateTrackTimeDisplay(objTrackTimes);
			if (!this.$.sound.audio.paused) {
				this.onAudioPlaying();
			}
			else {
				this.onAudioPaused();
			}
		}
	},
	getTrackCurrentTime: function ()
	{
		return this.$.sound.audio.currentTime;
	},
	getTrackDuration: function()
	{
		return this.$.sound.audio.duration;
	},
	onclick_next: function()
	{
		console.log("onclick_next");
		this.doClickNext();
	},
		
	onclick_prev: function()
	{
		console.log("onclick_prev");
		this.doClickPrev();
	},
		
	onclick_playpause: function()
	{
		console.log("onclick_playpause");
		if (this.boolAudioPlaying) {
			this.$.sound.audio.pause();
			this.boolAudioPlaying = false;
			this.setPlayPause();
		}
		
	},
	
	
	onclick_FullScreen: function ()
	{
		this.log();
		this.doClickFullScreen();
		
	},

	setPlayPause: function (boolAudioPlaying)
	{
		
		//this.log(boolAudioPlaying);
		this.$.btnPlay.addRemoveClass("paused", !boolAudioPlaying);
		this.$.btnPlay.setDisabled(!boolAudioPlaying);
		//this.$.btnPlay.srcChanged();
		
	},
	
		
	setFullscreen: function(boolFullscreen)
	{
		this.$.btnFullscreen.addRemoveClass("on", boolFullscreen);
		
	},
	
	
	updateTrackInfoDisplay: function ()
	{
		this.log();
		try
		{
			
			if(this.intervalCheckTrackTime !== undefined)
			{
				window.clearInterval(this.intervalCheckTrackTime);
			}
			
			this.$.lblSongTitle.setContent(this.trackInfo.strTrackTitle);
//			this.$.lblArtistName.setContent(objTrackInfo.strTrackArtist + " - "+ objTrackInfo.strTrackAlbum); design says no album name :/
			this.$.lblArtistName.setContent(this.trackInfo.strTrackArtist);

			
			this._boolUpdateSlider = true;
			this._boolUpdateTimeDisplay = true;
			
			
		}
		catch(err)
		{
			console.log("**** updateTrackDisplay error: " + err);
		}
		
	},	
		
	updateTrackTimeDisplay: function (objTrackTimes)
	{
		//console.log("updateTrackTimeDisplay objTrackTimes: " + objTrackTimes);
		//this.log("objTrackTimes: " + objTrackTimes);
		//this.log(this._boolUpdateTimeDisplay);

		if(this._boolUpdateTimeDisplay)
		{
			this.$.lblSongTime.setContent(Utilities.formatTime(objTrackTimes.floatTrackCurrentTime));
			//this.$.lblSongTime.setContent(Math.floor(objTrackTimes.floatTrackCurrentTime));
			this._intCurrentDuration = objTrackTimes.floatTrackDuration
			this.$.lblSongDuration.setContent(Utilities.formatTime(this._intCurrentDuration));
			//this.$.lblSongDuration.setContent(Math.floor(this._intCurrentDuration));
		}


		
		if(this._boolUpdateSlider)
		{
			var intBarPos = Math.floor((objTrackTimes.floatTrackCurrentTime / objTrackTimes.floatTrackDuration) * 100) ;

			this.$.sliderSongTime.setLockBar(true);
			this.$.sliderSongTime.setPositionImmediate(intBarPos);
			
		}
		
	},
	
	
	onClick_sliderSongTime: function (sender, event)
	{
		
		this.log();
		
		this._boolUpdateSlider = false;
		this._boolUpdateTimeDisplay = true;		
	},
	
	
	// Need to fix some issues with inner bar delay when dragging.
	onChange_sliderSongTime: function(sender,intPos)
	{
		this.log();		
		this._boolUpdateSlider = true;
		this._boolUpdateTimeDisplay = true;
		

		console.log(sender);
		console.log(intPos);

		this.$.lblSongTime.setContent(Utilities.formatTime(this._intCurrentDuration * intPos / 100));

		this.$.sliderSongTime.setPositionImmediate(intPos);

		this.updateSliderSongTime(intPos);
		
	},
	
	
	updateSliderSongTime: function (intPos)
	{
		
		this.log("intPos: " + intPos);
		this.log("src: ", this.$.sound.audio.src);
		
		if (this.$.sound.audio.src)
		{
			this.$.sound.audio.currentTime = this.getTrackDuration() * (intPos / 100);
		}
		
		//this._boolUpdateSlider = true;
		this._boolUpdateTimeDisplay = true;
		
	},
	
		
	onChanging_sliderSongTime: function (sender, intPos)
	{
		this.log();
		this._boolUpdateSlider = false;

		console.log(sender);
		console.log(event);
		console.log(intPos);
		this._boolUpdateTimeDisplay = false;
		
		this.$.lblSongTime.setContent(Utilities.formatTime(this._intCurrentDuration * intPos / 100));
	
		this.$.sliderSongTime.setPositionImmediate(intPos);
		//this.doSetPlaybackTime(intPos);

	},
	
	
	setShuffleButton: function (boolShuffleOn)
	{
		this.log(boolShuffleOn);
		this.$.btnShuffle.addRemoveClass("on", boolShuffleOn);
		

	},
	
	setRepeatButton: function (strRepeatMode)
	{
		this.log(strRepeatMode);
		this.$.btnRepeat.setClassName("toggleMode repeat " + strRepeatMode);
	
	},
	
	onGetVolume: function(intVolume)
	{
		
		if(this._boolUpdateVolumeSlider)
		{
			this.$.sliderVolume.setPositionImmediate(intVolume);
		}
		
		//this.$.sliderVolume.setBarPosition(intVolume);
		
	},
	
	onChange_sliderVolume: function(sender,intPos)
	{
		console.log("onChange_sliderVolume");
		//console.log(sender);
		//console.log(intPos);
		this.doSetVolume(intPos);
		this._boolUpdateVolumeSlider = true;

	},
	
	onChanging_sliderVolume: function (sender, intPos)
	{

		this._boolUpdateVolumeSlider = false;
		this.doSetVolume(intPos);

	},
	
	//enyo.Sound events
		onAudioConnected: function (event)
	{
		
	},
	onAudioLoaded: function (event)
	{
		this.log();	
	},
	
	onAudioPlayed: function (event)
	{
		this.log();
	},
	
	onAudioPlaying: function (event)
	{
		//this.log();
		this.boolAudioPlaying = true;
		this.boolAudioPaused = false;
		this.setPlayPause(this.boolAudioPlaying);
		this.$.btnPrev.setDisabled(false);
		this.$.btnNext.setDisabled(false);
		
	},
	
	onAudioPaused: function (event)
	{
		this.log();
		this.boolAudioPlaying = false;
		this.boolAudioPaused = true;		
		this.setPlayPause(this.boolAudioPlaying);
		clearInterval(this.playedIntervalId);
	},
	
	onAudioEnded: function (event)
	{
		this.log();
		this.doEnded();
	
	},
	
});
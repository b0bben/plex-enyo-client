enyo.kind({
	kind: "Toolbar",
	name: "plex.PlayerControl",
	height: "180px",
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
	published: {playEnabled: false, prevNextEnabled: false, src: undefined, context: undefined},
	components: [
			{kind: "Sound", audioClass: "media"},
			{kind: "VFlexBox", flex: 1, height: "100%", components: [

				{kind: "Control", flex:1, layoutKind: "VFlexLayout", align: "center", pack:"justify", components: [
					{kind: "HFlexBox", align: "center", className: "current", pack: "justify", components: [
						{kind: "Control", pack:"justify", align: "center", flex:1, className: "info", components: [
							{name: "lblArtistName", content: "Five finger death punch", className: "artist"},
							{name: "lblSongTitle", content: "No one gets left behind", className: "title"}
						]},
						
					]},
					{kind: "Control", layoutKind: "HFlexLayout", className: "progress", pack: "center", components: [  						//JC_UI
						{name: "lblSongTime", kind: "Control", className: "label elapsed", content: "--:--"},
						{name: "sliderSongTime", kind: "ProgressSlider", onChange: "onChange_sliderSongTime", onChanging: "onChanging_sliderSongTime", onclick: "onClick_sliderSongTime", tapPosition: true, lockBar: true, position:0, flex:1, disabled: true},
						{name: "lblSongDuration", kind: "Control", className: "label duration", content: "--:--"},
					]}
				]},
				/*
				{kind: "Control", layoutKind: "VFlexLayout", pack: "justify", components:[						//JC_UI
					{name: "btnShuffle", kind: "Control", className: "toggleMode shuffle", onclick:"doShuffleClick"}, //possible class values are off/on - let me know if switching classes is harder than say... set styles
					{name: "btnRepeat", kind: "Control", className: "toggleMode repeat", onclick: "doRepeatClick"}, //possible class values are off/on/one - let me know if switching classes is harder than say... set styles
					{name: "btnFullscreen", kind: "Control", style: "position: relative; left: 140px;", className: "toggleMode fullscreen", onclick: "onclick_FullScreen"},				
				]},
				*/
				{kind: "Control", className: "playback", layoutKind: "HFlexLayout", pack: "center", align: "center", components: [
					{name: "btnPrev", kind: "IconButton", className: "prev", icon:"images/btn_controls_prev.png", onclick: "onclick_prev", disabled: true}, // This needs to be changed to switch icons like btnPlay
					{name: "btnPlay", kind: "IconButton", className: "play paused", icon:"images/btn_controls_play.png", label: " ", onclick: "onclick_playpause", disabled: true},
					{name: "btnNext", kind: "IconButton", className: "next", icon:"images/btn_controls_next.png", onclick: "onclick_next", disabled: true} // This needs to be changed to switch icons like btnPlay
				]},

			]},

	],
	
	
	
	_boolUpdateSlider: true,
	_boolUpdateTimeDisplay: true,	
	_boolUpdateVolumeSlider: true,
	
	_intCurrentDuration: 0,
	
	
	create: function ()
	{
		this.inherited(arguments);
		
		this.doRequestVolume(enyo.bind(this,this.onGetVolume));
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
		this.doClickPlayPause();
		
	},
	
	
	onclick_FullScreen: function ()
	{
		this.log();
		this.doClickFullScreen();
		
	},
	
	
	playEnabledChanged: function ()
	{
		this.log()
		this.$.btnPlay.setDisabled(this.playEnabled ? false : true);
	},
	
	
	 prevNextEnabledChanged: function ()
	 {
		this.log();
		//This all needs to be redone to switch classes instead of src.
		this.$.btnPrev.setDisabled(this.prevNextEnabled ? false : true);
		this.$.btnNext.setDisabled(this.prevNextEnabled ? false : true);
	 },

	setPlayPause: function (boolAudioPlaying)
	{
		
		this.log(boolAudioPlaying);
		this.$.btnPlay.addRemoveClass("paused", !boolAudioPlaying);
		//this.$.btnPlay.srcChanged();
		
	},
	
		
	setFullscreen: function(boolFullscreen)
	{
		this.$.btnFullscreen.addRemoveClass("on", boolFullscreen);
		
	},
	
	
	updateTrackInfoDisplay: function (objTrackInfo)
	{
		this.log();
		try
		{
			
			if(this.intervalCheckTrackTime !== undefined)
			{
				window.clearInterval(this.intervalCheckTrackTime);
			}
			
			this.$.lblSongTitle.setContent(objTrackInfo.strTrackTitle);
//			this.$.lblArtistName.setContent(objTrackInfo.strTrackArtist + " - "+ objTrackInfo.strTrackAlbum); design says no album name :/
			this.$.lblArtistName.setContent(objTrackInfo.strTrackArtist);

			
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
		
		this.log();
		this.doSetPlaybackTime(intPos);
		
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

	}
	
	
	
});
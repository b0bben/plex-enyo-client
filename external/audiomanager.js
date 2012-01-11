enyo.kind(
{
	name: "kindAudioManager",
	kind: "Component",
	
	
	//boolAudioSetup: false, May not end up using
	
	published: {boolAudioPaused: true, boolAudioPlaying: false},
	
	events: {onPlaying: "", onEnded: "", onPausePlay: "", onSrcChanged: "", onAudioError: "", onAudioStall: ""},
	
	create: function ()
	{
		this.inherited(arguments);

		this.setupAudio();
		
		
	
	},
	
	_boolAudioLoaded: false,
	
	
	setupAudio: function ()
	{
		this.log();			
		if (this.objAudio === undefined)
		{
			this.objAudio = new Audio();
			this.objAudio.setAttribute("x-palm-media-audio-class", "media");
			
			this.objAudio.addEventListener('load', enyo.bind(this, this.onAudioLoaded), false);
			this.objAudio.addEventListener('play', enyo.bind(this, this.onAudioPlayed), false);
			this.objAudio.addEventListener('playing', enyo.bind(this, this.onAudioPlaying), false);
			this.objAudio.addEventListener('ended', enyo.bind(this, this.onAudioEnded), false);
			this.objAudio.addEventListener('pause', enyo.bind(this, this.onAudioPaused), false);
			
			this.objAudio.addEventListener('error', enyo.bind(this, this.onError_Play), false);
			this.objAudio.addEventListener('stalled', enyo.bind(this, this.onError_Stall), false);
		
			
		}		
		
		
	},
	
	resetAudio: function ()
	{
		
	},
	
		

	
	playAudio: function (strAudioFile, intStartTime, boolForced)
	{
		try
		{
			this.log("playing: " + strAudioFile);
			this.objAudio.src = strAudioFile;
			
			this.doSrcChanged(boolForced);
			
			//console.log("raised doSrcChanged");
			
			
			this.objAudio.load();
			this.objAudio.play();			
		}
		catch (err)
		{
			console.log("playAudio error: " + err);
		}
		
		
	},

	pauseAudio: function (boolPlayPause)
	{
		
		if(boolPlayPause === undefined)
		{
			boolPlayPause = !this.boolAudioPlaying;
		}

		this.log(boolPlayPause);

		if (!boolPlayPause)
		{
			this.objAudio.pause();
			this.boolAudioPlaying = false;
		}
		else
		{
			this.objAudio.play();
			this.boolAudioPlaying = true;
		}
		
		return this.boolAudioPlaying;
		

		
	},
	
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
		this.log();
		this.boolAudioPlaying = true;
		this.boolAudioPaused = false;
		this.doPausePlay(this.boolAudioPlaying);
		this.doPlaying();
		//this.doSrcChanged(); //moved back to playAudio as a test. May move it back
		
	},
	
	onAudioPaused: function (event)
	{
		this.log();
		this.boolAudioPlaying = false;
		this.boolAudioPaused = true;		
		this.doPausePlay(this.boolAudioPlaying);
	},
	
	onAudioEnded: function (event)
	{
		this.log();
		this.doEnded();
	
	},
	
	setAudioTime: function(intPos)
	{
		this.log("intPos: " + intPos);
		this.log("src: ", this.objAudio.src);
		
		if (this.objAudio.src)
		{
			this.objAudio.currentTime = this.getAudioDuration() * (intPos / 100);
		}
		
	},
	
	setAudioVolume: function(intPos)
	{
		this.objAudio.volume = intPos/100;
	},
	
	getAudioVolume: function()
	{
		return this.objAudio.volume;
	},		
	
	/*
	onAudioSrcChanged: function (event)
	{
		
		
	},
	*/
	
	
	onError_Play: function (event)
	{
		this.log();
		this.doAudioError(event);
	},
	
	onError_Stall: function (event)
	{
		this.log();
		//this.log(Object.keys(event));
		this.doAudioError(event);
	},
	
	onError_Disconnect: function (event)
	{
		this.doAudioError(event);
	},
	
	onError_Watchdog: function (event)
	{
		this.doAudioError(event);		
	},
	
	getAudioCurrentTime: function ()
	{
		return this.objAudio.currentTime;
	},
	
	getAudioDuration: function()
	{
		
		return this.objAudio.duration;
	}
	
	
	
	
	
	
	
	
	
	
	
});
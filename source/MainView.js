enyo.kind({
	name: "plex.MainView",
	kind: enyo.VFlexBox,
	components: [
		{kind:enyo.Pane, flex: 1, components: [
			{name: "musicPlayer", kind: 'plex.MusicPlayerControl', onClickNext: "onClickNext", onClickPrev: "onClickPrev" , onClickPlayPause: "onClickPlayPause", onSetPlaybackTime:"onSetPlaybackTime", onShuffleClick: "onShuffleClick_PlayModeControls", onRepeatClick: "onRepeatClick_PlayModeControls", onSetVolume: "onSetPlaybackVolume" , onRequestVolume: "onRequestSysVolume", onClickFullScreen: "onClick_FullScreen"},
			{name: "mainBrowsingView", kind: enyo.Control, layoutKind: "HFlexLayout", components:[
				{kind:enyo.VFlexBox, width:'320px', className: "enyo-bg", height: "100%", style:"border-right: 2px solid;", components: [
					{flex: 1, name: "left_pane", kind: "enyo.VFlexBox", components: [
					    {name: "header", kind: "Header",style: '-webkit-box-align: center !important;',pack: 'center', className: "enyo-header-dark", components: [
						    {kind: "Image", src: "images/PlexTextLogo.png", style: "padding: 0px !important;"}
						  ]},
						  {kind: enyo.Scroller, flex: 1, components: [
								{kind: "plex.MyPlexSectionsView", name: "localSectionsView",flex:1, onSelectedSection: "showGridView", showing: false, lazy: true},
								{kind: "plex.MyPlexSectionsView", name: "myPlexSectionsView",flex:1, onSelectedSection: "showGridView", showing: false, lazy:true},
							]},
							/*{kind: "Button", onclick: "openAppMenuHandler", caption: "appmenu"},*/
					]},
				]},
				{kind:enyo.VFlexBox, flex:1, components: [
		 			{flex: 1, name: "right_pane", align: "center", pack: "center",kind: "Pane", onSelectView: "viewSelected", components: [
						{kind: "plex.GridView", name: "grid_view"},
						{kind: "plex.StartView", name: "startView"},
					]}
				]},

				{kind: "AppMenu",
				    components: [
				        {caption: "Preferences & Servers", onclick: "showPreferences"},
				    ]
				},
			]},
			{name:"prefsView", kind:"plex.PreferencesView", lazy: true, showing: false, onClose:"closePrefsView"},
			{name: "videoPlayer", kind: "PlexViewVideo", flex:1, lazy: true, showing: false},
			{kind: "plex.WelcomeView", name: "welcomeView",lazy: true, showing: false},
		]},
	],
	create: function() {
		this.inherited(arguments);
		this.$.pane.selectViewByName("mainBrowsingView");
		this.rootMediaContainer = "";
		this.selectedSection = "";
		//local networks sections
		window.PlexReq.setCallback(enyo.bind(this,"gotLocalSections"));
		window.PlexReq.setServersRefreshedCallback(enyo.bind(this,"gotServersRefreshed"));
		//start collecting servers
		window.PlexReq.searchNearbyServerWithBonjour();
		//start getting local sections, response from this will start getting myplex sections as well...
		window.PlexReq.librarySections();		
		this.log();
	},
	gotLocalSections: function(pmc) {
		if (pmc !== undefined && pmc.length > 0) {
			//this.$.left_pane.render();
			//this.$.left_pane.selectViewByName("localSectionsView");
			//this.$.myPlexSectionsView.setShowing(true);
			this.$.localSectionsView.show();
			this.$.localSectionsView.setLocalMediaContainer(pmc);

			
		}
		else {
			//TODO: this.$.pane.selectViewByName("welcomeView");
		}

		//myplex sections
		window.PlexReq.setCallback(enyo.bind(this,"gotMyPlexSections"));
		window.PlexReq.myPlexSections();
	
	},
	gotMyPlexSections: function(pmc) {
		if (pmc !== undefined && pmc.length > 0) {
			//this.$.left_pane.render();
			//this.$.left_pane.selectViewByName("myPlexSectionsView");
			this.$.myPlexSectionsView.show();
			this.$.myPlexSectionsView.setMyplexMediaContainer(pmc);

			
		}
		else {
			//TODO: this.$.pane.selectViewByName("welcomeView");
		}
	},
	gotServersRefreshed: function() {
		this.log("servers refreshed, refreshing sections...");
		window.PlexReq.setCallback(enyo.bind(this,"gotLocalSections"));
		window.PlexReq.librarySections(); //refresh sections
	},
	showGridView: function(inSender, inSection) {
		this.selectedSection = inSection; //actually both the section AND the server it belongs to
    this.$.right_pane.selectViewByName("grid_view");
	},
	gotRecentlyAdded: function(pmc) {
		this.$.startView.setServer(pmc[0].server);
		this.$.startView.setMediaContainer(pmc[0].pmc);
		this.$.right_pane.selectViewByName("startView");		
	},
	viewSelected: function(inSender, inView, inPreviousView) {
		if (this.selectedSection) {
			inView.setParentMediaContainer(this.selectedSection);	
		}
	},
	showPreferences: function() {
		this.$.pane.selectViewByName("prefsView");
	},
	preferencesReceived: function(inSender, inDefaultUrl) {
	    this.$.search.setFeedUrl(inDefaultUrl);
	},
	serverFormSaved: function(inSender, inFeedUrl) {
	    this.$.search.setFeedUrl(inFeedUrl);
	    this.$.pane.back();
	},
	preferencesCanceled: function(inSender) {
	    this.$.left_pane.back();
	},
	openAppMenuHandler: function() {
	    this.$.appMenu.open();
	},
	closeAppMenuHandler: function() {
	    this.$.appMenu.close();
	},
	closePrefsView: function(inView) {
		clearInterval(this.$.prefsView.intervarlTimerId);
		this.$.pane.back();
		//enyo.scrim.show();
		//refresh sections after being in prefs
		window.PlexReq.setCallback(enyo.bind(this,"gotMyPlexSections"));
		window.PlexReq.loadPrefsFromCookie();
		//window.PlexReq.librarySections();
		window.PlexReq.myPlexSections();
		
	},
	startVideoPlayer: function(src, pmo, server, resume) {
		window.PlexReq.stopReachabilityChecking();
	 this.$.pane.selectViewByName("videoPlayer");
	  //src = "http://qthttp.apple.com.edgesuite.net/1010qwoeiuryfg/sl.m3u8";
    //src = "http://video.nationalgeographic.com/video/player/media-mp4/frog_bull/mp4/variant-playlist.m3u8";
    this.$.videoPlayer.setServer(server); //ATTENTION! MUST COME BEFORE PMO
  	this.$.videoPlayer.setResume(resume);
  	this.$.videoPlayer.setPmo(pmo);
    this.$.videoPlayer.setVideoSrc(src);

    /* TEST STUFF
    this.$.pane.selectViewByName("vidobject");
    this.$.vidobject.setVideoSrc(src);
    */
	},


	//music player events and stuff
	startMusicPlayback: function(trackInfo) {
		this.log();
		if(trackInfo)
		{
			this.$.musicPlayer.setShowing(true);
			this.$.musicPlayer.setTrackInfo(trackInfo);
		}

	},

	
	onRequestCurrTrackInfo: function ()
	{
			this.log();	
			this.sendTrackInfo(false);
	},
	
	
	onTrackPausePlay: function (sender, boolAudioPlaying)
	{
		this.log();
		
		this.$.PlayerControl.setPlayPause(boolAudioPlaying);
		
		this.$.DashboardManager.setPlayPause(boolAudioPlaying);
		
		if(this.boolAlbumArtViewDisplay)
		{		
			this.$.AlbumArtView.setPlayPause(boolAudioPlaying);
		}
		
		this.updateBroadcaster({type: "playChanged", boolPlaying: boolAudioPlaying});
		
		
	},	
	
	onUpdateTrackInfo: function ()
	{
		
	},
	
	onUpdateTrackTime: function (sender, objTrackTimes)
	{
		//this.log("objTrackTimes: " + objTrackTimes);
		this.$.PlayerControl.updateTrackTimeDisplay(objTrackTimes);
	},
	
	
	//PlayerControl Events
	
	
	onClickNext: function ()
	{
		this.$.Playback.nextTrack(true);
	},
	
	onClickPrev: function ()
	{
		this.$.Playback.prevTrack(true);
	},
	
	onClickPlayPause: function ()
	{
		
		this.playPause();

		
	},
	
	playPause: function (boolForcePlayPause)
	{
		
		if(this.$.Playback.getBoolPlaybackListSet())
		{
			this.$.Playback.pausePlayback(boolForcePlayPause);
		}	
	},
});
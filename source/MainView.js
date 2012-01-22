enyo.kind({
	name: "plex.MainView",
	kind: enyo.VFlexBox,

	components: [
		{ name: "betaExpiredDlg", kind: "MessageDialog", message: $L("I'm hungry.") },
		{kind: "AppMenu", components: [
				{caption: "Preferences & Servers...", onclick: "showPreferences"},
		]},
		{kind: "ApplicationEvents", onWindowRotated: "windowRotated"},
		{kind:enyo.Pane, flex: 1,components: [
			{name: "mainBrowsingView", kind: enyo.SlidingPane,className: "enyo-bg", flex: 1, onSelectView: "viewSelected", components:[
				{name: "left", width:'320px', components: [
				    {name: "header", kind: "Header",style: '-webkit-box-align: center !important;',pack: 'center', className: "enyo-header-dark", components: [
					    {kind: "Image", src: "images/PlexTextLogo.png", style: "padding: 0px !important;"}
					  ]},
					  {kind: enyo.Scroller, flex: 1, components: [
							{kind: "plex.MyPlexSectionsView", name: "localSectionsView",flex:1, onSelectedSection: "showGridView"},
							{kind: "plex.MyPlexSectionsView", name: "myPlexSectionsView",flex:1, onSelectedSection: "showGridView", showing: false, lazy:true},
						]},
						{kind: "Button", name: "browserMenuButton", showing: false, onclick: "openAppMenuHandler", caption: "appmenu"},
						{name: "musicPlayer", kind: 'plex.MusicPlayerControl', showing: false, onClickNext: "onClickNext", onClickPrev: "onClickPrev" , onClickPlayPause: "onClickPlayPause", onSetPlaybackTime:"onSetPlaybackTime", onShuffleClick: "onShuffleClick_PlayModeControls", onRepeatClick: "onRepeatClick_PlayModeControls", onSetVolume: "onSetPlaybackVolume" , onRequestVolume: "onRequestSysVolume", onClickFullScreen: "onClick_FullScreen"},
				]},

				{name: "middle", flex: 1, components: [
					{kind: "plex.GridView", name: "grid_view", onShowPreplay: "showPreplay"},
				]},

			]},
			{name:"prefsView", kind:"plex.PreferencesView", lazy: true, showing: false, onClose:"closePrefsView"},
			{name: "videoPlayer", kind: "PlexViewVideo", flex:1, lazy: true, showing: false},
			{kind: "plex.WelcomeView", name: "welcomeView",lazy: true, showing: false},
			
		]},
	],
	create: function() {
		this.inherited(arguments);
		window.Metrix = new Metrix();
		//this.checkIfBetaExpired();

		if (!enyo.fetchDeviceInfo()) {
			this.$.browserMenuButton.show();
		}
		 
		 //collect some stats
		window.Metrix.postDeviceData();
		
		this.$.pane.selectViewByName("mainBrowsingView");
		this.rootMediaContainer = "";
		this.selectedSection = "";

		if (window.Metrix.isExpired(30)) {
			this.$.pane.selectViewByName("welcomeView");
		} 
		else
		{
			//start collecting servers
			window.PlexReq.searchNearbyServerWithBonjour();
			this.startLookingForServers();	
		}	
		

	},
	windowRotated: function(inSender) {
    // do work when orientation changes
    this.$.mainBrowsingView.resized();
	},
	startLookingForServers: function() {
		//local networks sections
		window.PlexReq.setLocalRefreshedCallback(enyo.bind(this,"gotLocalSections"));
		//start getting local sections, response from this will start getting myplex sections as well...
		window.PlexReq.librarySections();	
		window.PlexReq.setServersRefreshedCallback(enyo.bind(this,"gotServersRefreshed"));

		//myplex sections
		window.PlexReq.setMyPlexRefreshedCallback(enyo.bind(this,"gotMyPlexSections"));
		window.PlexReq.myPlexSections();
	
		this.log();			
	},
	checkIfBetaExpired: function() {
		if (window.Metrix.isExpired(-30)) {
			this.$.betaExpiredDlg.openAtCenter();
			//TODO: show dialog or something telling user this version has expired
		}	
	},
	dialogHandler: function (inSender) {
    // do stuff here, after the dialog box has been closed
    window.close();
  },
	gotLocalSections: function(pmc) {
		if (pmc !== undefined && pmc.length > 0) {
			this.log(pmc);
			
			//this.$.left_pane.selectViewByName("localSectionsView");
			//this.$.myPlexSectionsView.setShowing(true);
			this.$.localSectionsView.show();	
			this.$.localSectionsView.setLocalMediaContainer(pmc);
			
			
		}
		else {
			//TODO: this.$.pane.selectViewByName("welcomeView");
		}


	
	},
	gotMyPlexSections: function(pmc) {
		if (pmc !== undefined && pmc.length > 0) {
			this.log(pmc);
			//this.$.left.render();
			//this.$.left_pane.selectViewByName("myPlexSectionsView");
			this.$.myPlexSectionsView.show();	
			this.$.myPlexSectionsView.setMyplexMediaContainer(pmc);

			
		}
		else {
			this.$.myPlexSectionsView.hide();
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
    this.$.grid_view.setParentMediaContainer(this.selectedSection);
	},
	gotRecentlyAdded: function(pmc) {
		this.$.startView.setServer(pmc[0].server);
		this.$.startView.setMediaContainer(pmc[0].pmc);
		this.$.mainBrowsingView.selectViewByName("startView");		
	},
	viewSelected: function(inSender, inView, inPreviousView) {
		if (this.selectedSection) {
			//inView.setParentMediaContainer(this.selectedSection);	
		}
	},
	showPreferences: function() {
		this.$.pane.selectViewByName("prefsView");
	},
	preferencesCanceled: function(inSender) {
	    this.$.pane.back();
	},
	openAppMenuHandler: function() {
	    this.$.appMenu.open();
	},
	closeAppMenuHandler: function() {
	    this.$.appMenu.close();
	},
	closePrefsView: function(inView) {
		this.log();
		//clearInterval(this.$.prefsView.intervarlTimerId);
		this.$.pane.back();
		this.$.prefsView.hide();
		//enyo.scrim.show();
		//refresh sections after being in prefs
		//window.PlexReq.setCallback(enyo.bind(this,"gotMyPlexSections"));
		//window.PlexReq.loadPrefsFromCookie();
		//window.PlexReq.librarySections();
		//window.PlexReq.myPlexSections();
		this.startLookingForServers();
		
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

		//STATS LOGGING
		if (window.Metrix) {
			window.Metrix.customCounts("Video", "StartVideo",1);
		}
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
});
enyo.kind({
	name: "plex.MainView",
	kind: enyo.HFlexBox,
	components: [
		{kind:enyo.Pane, flex: 1, components: [
			{name: "mainBrowsingView", kind: enyo.Control, layoutKind: "HFlexLayout", components:[
				{kind:enyo.VFlexBox, width:'320px', height: "100%", style:"border-right: 2px solid;", components: [
					{flex: 1, name: "left_pane", kind: "Pane", components: [
						{kind: "plex.SectionsView", name: "sectionsView",flex:1, onSelectedSection: "showGridView"},
					]},
					{name: "musicPlayer", kind: "plex.PlayerControl"},
					/*{kind: "Toolbar", components: [
						{kind: "GrabButton"},
						{caption: "Go", onclick: "doGo"}
					]},*/
				]},
				{kind:enyo.VFlexBox, flex:1, components: [
		 			{flex: 1, name: "right_pane", align: "center", pack: "center",kind: "Pane", onSelectView: "viewSelected", components: [
						{kind: "plex.GridView", name: "grid_view"},
						{kind: "plex.WelcomeView", name: "welcomeView"},
						{kind: "plex.StartView", name: "startView"},
					]}
				]},

				//{name: "PlayerControl", kind: 'kindPlayerControl', onClickNext: "onClickNext", onClickPrev: "onClickPrev" , onClickPlayPause: "onClickPlayPause", onSetPlaybackTime:"onSetPlaybackTime", onShuffleClick: "onShuffleClick_PlayModeControls", onRepeatClick: "onRepeatClick_PlayModeControls", onSetVolume: "onSetPlaybackVolume" , onRequestVolume: "onRequestSysVolume", onClickFullScreen: "onClick_FullScreen"},

				{kind: "AppMenu",
				    components: [
				        {caption: "Preferences & Servers", onclick: "showPreferences"},
				    ]
				},
			]},
			{name:"prefsView", kind:"plex.PreferencesView", lazy: true, showing: false, onClose:"closePrefsView"},
			{name: "videoPlayer", kind: "PlexViewVideo", flex:1, lazy: true, showing: false},
		]},
		
	],
	create: function() {
		this.inherited(arguments);
		this.$.pane.selectViewByName("mainBrowsingView");
		this.rootMediaContainer = "";
		this.selectedSection = "";
		this.plexReq = new PlexRequest(enyo.bind(this,"gotSections"));
		this.plexReq.librarySections();
		
	},
	gotSections: function(plexMediaContainer) {
		this.rootMediaContainer = plexMediaContainer;
		//this.$.left_pane.createComponents([{kind: "plex.SectionsView", name: "view_sections", parentMediaContainer: plexMediaContainer,headerContent: plexMediaContainer.title1, flex:1, owner:this}]);
		this.log("got sections for " + this.rootMediaContainer.length + " servers");
		//no servers added, show first-run
		if (this.rootMediaContainer.length < 1) {
			this.$.right_pane.selectViewByName("welcomeView");
		}
		else {
			//clean startup, let's show recently added in the grid
			this.plexReq = new PlexRequest(enyo.bind(this,"gotRecentlyAdded"));
			this.plexReq.recentlyAdded();
		}
		this.$.left_pane.render();
		this.$.sectionsView.setParentMediaContainer(this.rootMediaContainer);
		this.$.left_pane.selectViewByName("sectionsView");
		//enyo.scrim.hide();
	
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
	    inView.setParentMediaContainer(this.selectedSection);
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
		this.$.pane.back();
		//enyo.scrim.show();
		//refresh sections after being in prefs
		this.plexReq = new PlexRequest(enyo.bind(this,"gotSections"));
		this.plexReq.loadServerListFromCookie();
		this.plexReq.librarySections();
		
	},
	startVideoPlayer: function(src, pmo, server) {
	  	this.$.pane.selectViewByName("videoPlayer");
	  	//src = "http://devimages.apple.com/iphone/samples/bipbopall.html";
    	//src = "/media/internal/movies/Robotar.m4v";
  	this.$.videoPlayer.setVideoSrc(src);
    this.$.videoPlayer.setPmo(pmo);
    this.$.videoPlayer.setServer(server);
    this.$.videoPlayer.autoStartOnLoad();
    
	},
	startMusicPlayback: function(src, context) {
		this.$.musicPlayer.setShowing(true);
		this.$.musicPlayer.setSrc(src);
		this.$.musicPlayer.setContext(context);
		this.$.musicPlayer.startPlayback();

	}
});
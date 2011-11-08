enyo.kind({
	name: "plex.WelcomeView",
	kind: enyo.VFlexBox,
	pack: "center",
	className: "enyo-fit enyo-bg",
	components: [
		{name: "shadow", className: "enyo-sliding-view-shadow"},
		
		{kind: "PageHeader", name: "grid_header", className: "center-stuff",pack: 'center',content: "Welcome to Plex", className: "enyo-header-dark"},
		{kind: enyo.HFlexBox, flex: 1, components: [
			{kind: enyo.Spacer},
			{flex: 1, layoutKind: "VFlexLayout", pack: "center", className: "center-stuff",  components: [
				{kind: enyo.Image, pack: 'center',flex: 1,src: "PlexMobile_512x512.png", style: "width: 256px; height: 256px; padding-bottom: 40px"},
				{kind: enyo.Button, pack: 'center',caption: "Preferences & Servers", width: "200px", onclick: "buttonClick", className: "enyo-button-dark"},	
			  {kind: enyo.Spacer},
	
			  
			  /*{kind: enyo.Video, pack: 'center', fitToWindow: true, src: "http://saturnus.mine.nu:32400/video/:/transcode/segmented/start.m3u8?url=http%3A%2F%2Fsaturnus.mine.nu%3A32400%2Flibrary%2Fparts%2F3395%2Ffile.avi&ratingKey=3492&identifier=com.plexapp.plugins.library&key=http%3A%2F%2Fsaturnus.mine.nu%3A32400%2Flibrary%2Fmetadata%2F3492&session=a83b42e021f2c7f9d3876c8797f6c0b1ede47d8c&quality=5&3g=0"},
			  {kind: enyo.Button, pack: 'center',caption: "TEST: play HLS video", width: "200px", onclick: "buttonPlay", className: "enyo-button-dark"},	*/
			]},
		]},
	  
	],
	create: function() {
		this.inherited(arguments);
	},
	buttonClick: function() {
		this.owner.showPreferences();
	},
	buttonPlay: function() {
		this.$.video.play();
	},
 });
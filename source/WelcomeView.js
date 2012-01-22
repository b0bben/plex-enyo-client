enyo.kind({
	name: "plex.WelcomeView",
	kind: enyo.VFlexBox,
	pack: "center",
	className: "enyo-fit",
	style: "background: white;",
	components: [
		{kind: enyo.HFlexBox, flex: 1, components: [
			{flex: 1, layoutKind: "VFlexLayout", pack: "center", align: "center", className: "center-stuff",  components: [
				{kind: enyo.Spacer},
				{kind: enyo.Image, pack: 'center',flex: 1, src: "images/sad_panda.png", style: "width: 508px; height: 399px;padding-bottom: 40px"},
				{content: "This BETA version of Plex for webOS has expired."},
				{content: "Please go to the App Catalog and look for a real version, or goto forums.plexapp.com and look for a new BETA."},
				{content: "Thank you for your interest. //plex team"},
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
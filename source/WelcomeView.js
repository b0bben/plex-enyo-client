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
				{kind: enyo.Button, pack: 'center',caption: "Preferences & Servers", width: "200px", onclick: "buttonClick", className: "enyo-button-dark"}		
			]},
			{kind: enyo.Spacer},
		]},
	],
	create: function() {
		this.inherited(arguments);
	},
	buttonClick: function() {
		this.owner.showPreferences();
	}
 });
enyo.kind({
	name: "plex.PreferencesView",
	kind: enyo.VFlexBox,
	className: "basic-back",
	published: {
		browserPreferences: {},
		systemPreferences: {},
		searchPreferences: [],
		defaultSearch: ""
	},
	events: {
		onPreferenceChanged: "",
		onClose: ""
	},
	components: [
		{kind: enyo.Pane, flex: 1, components: [
			{name: "serverForm", kind: "plex.ServerFormView", onSave: "newServerAdded", onDelete: "serverRemoved",onCancel: "backHandler", lazy: true, showing: false},
			{name: "mainPrefs", kind: enyo.Control, layoutKind: "VFlexLayout", components:[
				{name: "header", kind: "PageHeader", className: "preferences-header", pack: "center", components: [
					{kind: "Image", src: "images/PlexIcon.png", className: "preferences-header-image"},
					{content: $L("Preferences")}
				]},
				{kind: "Scroller", flex: 1, components: [
					{kind: "Control", className: "enyo-preferences-box", components: [
						{content:$L("All servers set to 'Show' will be available for browsing."), className: "prefs-body-text", style:"margin:none;"},
						{kind: "RowGroup", caption: $L("Plex Media Servers"), style: "margin-bottom: 10px", components: [
							{name: "serverList", kind:enyo.VirtualRepeater, style: "margin: -10px;", onSetupRow: "listSetupRow",components: [
								{kind: enyo.Item, className: "server-list-item", components: [
									{kind: "LabeledContainer", name: "serverName", onclick: "listItemTap", label: "Server nr 1", components: [
										{kind: "ToggleButton", name: "includeServer", onclick: "", onLabel: $L("Show"), offLabel: $L("Hide"), onChange: "togglePreferenceClick",}
									]},
								]}
							]}
						]},
						{kind: "Button", caption: $L("Add new server ..."), onclick: "showAddServerForm"},
						/*
						{kind: "RowGroup", caption: $L("Autofill"), components: [
							{kind: "LabeledContainer", caption: $L("Names and Passwords"), components: [
								{kind: "ToggleButton", name: "rememberPasswords", onChange: "togglePreferenceClick", preference: "rememberPasswords"}
							]}
						]},
						{kind: "Button", caption: $L("Clear Autofill Information"), onclick: "", dialog: ""},
						*/
						{kind: "RowGroup", caption: $L("Video quality"), components: [
							{kind: "ListSelector", name: "videoQuality", value: 1, onChange: "videoQualityChange", items: [
								{caption: $L("8 Mbps, 1080p"), value: 1},
								{caption: $L("4 Mbps, 720p"), value: 1},
								{caption: $L("3 Mbps, 720p"), value: 1},
								{caption: $L("2 Mbps, 720p"), value: 1},
								{caption: $L("1.5 Mbps, 480p"), value: 1},
								{caption: $L("720 kbps, 320p"), value: 1},
							]}
						]},
						{content:$L('Higher quality settings provide better looking video, but require more network bandwith.'), className: "prefs-body-text", style:"margin-bottom:8px"},
					]}
				]},
				{kind: "Toolbar", pack: "center", className: "enyo-toolbar-light", components: [
		 	   	{kind: "Button", caption: $L("Done"), onclick: "doClose", className: "enyo-preference-button enyo-button-affirmative"}
				]},
			]}
		]},			
	],
	create: function() {
		this.inherited(arguments);
		this.servers = [];
		this.loadPrefs();
		
		this.$.pane.selectViewByName("mainPrefs");
	},
	loadPrefs: function() {
		var prefCookie = enyo.getCookie("prefs");
		
		if (prefCookie !== undefined) {
			var prefs = enyo.json.parse(prefCookie);
			this.servers = prefs;
			this.$.serverList.render();
		}
	},
	savePrefs: function() {
		enyo.setCookie("prefs", enyo.json.stringify(this.servers));
	},
	showAddServerForm: function(inSender) {
		this.$.pane.selectViewByName("serverForm");
		this.$.serverForm.setServer(undefined);
	},
	newServerAdded: function(inSender, inServer) {
		this.servers.push(inServer);
		this.savePrefs();
		this.$.pane.back();
		
		this.loadPrefs(); //force refresh of settings
	},
	serverRemoved: function(inSender, inServerIndex) {
		this.servers.remove(inServerIndex);
		this.savePrefs();
		this.$.pane.back();
		
		this.loadPrefs(); //force refresh of settings
	},
	backHandler: function(inSender) {
		this.$.pane.back();
	},
	listSetupRow: function(inSender, inIndex) {
		this.log("listar servers");
		
    // check if the row is selected
		if (this.servers !== undefined && inIndex < this.servers.length) {
			this.$.serverName.setLabel(this.servers[inIndex].name);
			this.$.includeServer.setState(this.servers[inIndex].include)
			return true;
		}
	},
	listItemTap: function(inSender, inEvent) {
		selectedRow = inEvent.rowIndex;
		if (selectedRow < this.servers.length) {
			var server = this.servers[selectedRow];
			this.$.pane.selectViewByName("serverForm");
			this.$.serverForm.setServer(server);
			
		}
	}
});
// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

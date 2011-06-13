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
			{name: "header", kind: "PageHeader", className: "preferences-header", pack: "center", components: [
				{kind: "Image", src: "images/header-icon-prefs.png", className: "preferences-header-image"},
				{content: $L("Preferences")}
			]},
			{kind: "Scroller", flex: 1, components: [
				{kind: "Control", className: "enyo-preferences-box", components: [
					{kind: "RowGroup", caption: $L("Plex Media Servers"), style: "margin-bottom: 10px", components: [
						{kind: "LabeledContainer", caption: $L("Block Popups"), components: [
							{kind: "ToggleButton", name: "blockPopups", onChange: "togglePreferenceClick", preference: "blockPopups", type: "Browser"}
						]},
						{kind: "LabeledContainer", caption: $L("Accept Cookies"), components: [
							{kind: "ToggleButton", name: "acceptCookies", onChange: "togglePreferenceClick", preference: "acceptCookies", type: "Browser"}
						]},
						{kind: "LabeledContainer", caption: $L("Enable JavaScript"), components: [
							{kind: "ToggleButton", name: "enableJavascript", onChange: "togglePreferenceClick", preference: "enableJavascript", type: "Browser"}
						]},
						{kind: "LabeledContainer", caption: $L("Enable Flash"), components: [
							{kind: "ToggleButton", name: "flashplugins", onChange: "togglePreferenceClick", preference: "flashplugins", type: "System"}
						]},
						{kind: "LabeledContainer", caption: $L("Autoload Flash"), components: [
							{kind: "ToggleButton", name: "click2play", onChange: "togglePreferenceClick", preference: "click2play", type: "System", inverted: true}
						]}
					]},
					{kind: "Button", caption: $L("Add new server"), onclick: "showAddServerForm"},
					{kind: "Button", caption: $L("Clear History"), onclick: "promptButtonClick", dialog: "clearHistoryPrompt"},
					{kind: "Button", caption: $L("Clear Cookies"), onclick: "promptButtonClick", dialog: "clearCookiesPrompt"},
					{kind: "Button", caption: $L("Clear Cache"), onclick: "promptButtonClick", dialog: "clearCachePrompt"},
					/*
					{kind: "RowGroup", caption: $L("Autofill"), components: [
						{kind: "LabeledContainer", caption: $L("Names and Passwords"), components: [
							{kind: "ToggleButton", name: "rememberPasswords", onChange: "togglePreferenceClick", preference: "rememberPasswords"}
						]}
					]},
					{kind: "Button", caption: $L("Clear Autofill Information"), onclick: "", dialog: ""},
					*/
					]}
				]},
		
			{kind: "Toolbar", pack: "center", className: "enyo-toolbar-light", components: [
		 	   	{kind: "Button", caption: $L("Done"), onclick: "doClose", className: "enyo-preference-button enyo-button-affirmative"}
			]},
	],
	create: function() {
		this.inherited(arguments);
	},
	browserPreferencesChanged: function() {
		this.log();
		this.updatePreferences(this.browserPreferences);
	},
	systemPreferencesChanged: function() {
		this.log();
		this.updatePreferences(this.systemPreferences);
	},
	searchPreferencesChanged: function() {
		var items = [];
		for (var i=0,s;s=this.searchPreferences[i];i++) {
			items.push({caption: s.displayName, value: s.id});
			this.$.searchPreference.setItems(items);
		}
	},
	defaultSearchChanged: function() {
		this.$.searchPreference.setValue(this.defaultSearch);
	},
	updatePreferences: function(inPreferences) {
		for (key in inPreferences) {
			var value = inPreferences[key];
			if (this.$[key] !== undefined) {
				if (this.$[key].inverted) {
					this.$[key].setState(!value);
				} else {
					this.$[key].setState(value);
				}
			}
		}
	},
	togglePreferenceClick: function(inSender, inState) {
		if (inSender.inverted) {
			this.fireChange(inSender.preference, inSender.type, !inState);
		} else {
			this.fireChange(inSender.preference, inSender.type, inState);
		}
	},
	showAddServerForm: function(inSender) {
		this.owner.selectViewByName("serverForm");
	},
	completePrompt: function(inSender) {
		this.fireChange(inSender.preference);
	},
	searchPreferenceChange: function(inSender, inValue) {
		this.fireChange("defaultSearch", "Search", inSender.getValue());
	},
	fireChange: function(inPreference, inType, inValue) {
		this.doPreferenceChanged(inPreference, inType, inValue);
	}
});

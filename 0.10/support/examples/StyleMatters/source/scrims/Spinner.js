/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "scrims.Spinner",
	kind: HeaderView,
	components: [
		{kind: "Button", caption: "Show Scrim", onclick: "btnClick"},
		{kind: "Scrim", layoutKind: "VFlexLayout", align: "center", pack: "center", components: [
			{kind: "SpinnerLarge"}
		]}
	],
	showScrim: function(inShowing) {
		this.$.scrim.setShowing(inShowing);
		this.$.spinnerLarge.setShowing(inShowing);
	},
	create: function() {
		this.inherited(arguments);
		this.showScrim(true);
	},
	clickHandler: function() {
		this.showScrim(false);
		return;
	},
	btnClick: function() {
		this.showScrim(true);
		return true;
	}
});

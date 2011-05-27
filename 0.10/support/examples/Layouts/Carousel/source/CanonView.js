/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "CanonView",
	kind: enyo.VFlexBox,
	published: {
		headerContent: "",
		bodyColor: ""
	},
	components: [
		{kind: "Header"},
		{kind: "Scroller", flex: 1, components: [
			{name: "body"}
		]}
	],
	create: function() {
		this.inherited(arguments);
		this.headerContentChanged();
		this.bodyColorChanged();
	},
	headerContentChanged: function() {
		this.$.header.setContent(this.headerContent);
	},
	bodyColorChanged: function() {
		this.$.body.applyStyle("background-color", this.bodyColor);
	}
});
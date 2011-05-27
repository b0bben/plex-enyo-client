/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "PrintDemo",
	kind: enyo.VFlexBox,
	components: [
		{kind: "SlidingPane", flex: 1, components: [
			{name: "left", width: "250px", components: [
				{name: "leftPageHeader", kind: "PageHeader", content: "Print Demo"},
				{kind: "RowItem", tapHighlight: true, onclick: "showPrintImagesView", components: [
					{content: "Print Images Example"},
					{content: "Using print dialog to print images", style: "font-size:14px;color:gray"}
				]},
				{kind: "RowItem", tapHighlight: true, onclick: "showPrintFrameView", components: [
					{content: "Print Frame Example"},
					{content: "Using print dialog to print a frame", style: "font-size:14px;color:gray"}
				]}
			]},
			{name: "right", peekWidth: 50, edgeDragging: true, flex: 1, components: [
				{name: "rightPageHeader", kind: "PageHeader", content: ""},
				{kind: "Pane", flex: 1, transitionKind: "enyo.transitions.Fade", components: [
					{kind: "PrintImagesView"},
					{kind: "PrintFrameView"}
				]}
			]}
		]}
	],
	create: function() {
		this.inherited(arguments);
		this.showPrintImagesView();
	},
	showPrintImagesView: function() {
		this.$.rightPageHeader.setContent("Print Images Example");
		this.$.pane.selectView(this.$.printImagesView);
	},
	showPrintFrameView: function() {
		this.$.rightPageHeader.setContent("Print Frame Example");
		this.$.pane.selectView(this.$.printFrameView);
	}
});

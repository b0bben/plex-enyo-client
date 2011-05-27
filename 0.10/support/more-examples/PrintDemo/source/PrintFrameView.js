/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "PrintFrameView",
	kind: enyo.VFlexBox,
	components: [
		{content: "This is the only content that should be printed in the default frame.", flex:1},
		{kind: "HFlexBox", defaultKind: "Button", components: [
			{caption: "Print Default Frame", flex: 1, onclick: "printDefaultFrameClick"},
			{caption: "Print Sample Frame", flex: 1, onclick: "printSampleFrameClick"},
		]},
		{kind: "PrintDialog", 
			duplexOption: true,
			mediaTypeOption: true,
			colorOption: true,
			qualityOption: true,
			appName: "PrintWebPage"}
	],
	printDefaultFrameClick: function() {
		this.$.printDialog.setFrameToPrint({name: "", landscape:false});
		this.$.printDialog.openAtCenter();
	},
	printSampleFrameClick: function() {
		this.$.printDialog.setFrameToPrint({name: "sample-frame"});
		this.$.printDialog.openAtCenter();
	}
});

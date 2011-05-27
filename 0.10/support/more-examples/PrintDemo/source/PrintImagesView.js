/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "PrintImagesView",
	kind: enyo.VFlexBox,
	currentImage: 0,
	largeImages: [
		"mock/images/CIMG0002.jpg",
		"mock/images/P1020802.jpg",
		"mock/images/P1100076.jpg",
		"mock/images/P1100942.jpg",
		"mock/images/P1110439.jpg",
		"mock/images/P1120582.jpg",
		"mock/images/P1130184.jpg"
	],
	components: [
		{kind: "BasicImageView", name: "imageViewer", flex: 1, onSnap: "imageViewerSnap",
			images: [
				"mock/images/CIMG0002.jpg",
				"mock/images/P1020802small.jpg",
				"mock/images/P1100076small.jpg",
				"mock/images/P1100942small.jpg",
				"mock/images/P1110439small.jpg",
				"mock/images/P1120582small.jpg",
				"mock/images/P1130184small.jpg"
			]
		},
		{kind: "HFlexBox", defaultKind: "Button", components: [
			{caption: "Print Image", flex: 1, onclick: "printImageButtonClick"},
			{caption: "Print All Images", flex: 1, onclick: "printAllImagesButtonClick"},
		]},
		{kind: "PrintDialog", 
			copiesRange: {min: 1, max:20},
			duplexOption: true,
			mediaSizeOption: true,
			mediaTypeOption: true,
			colorOption: true,
			pageRange: {min:1, max:20},
			qualityOption: true,
			appName: "Mojo3 PrintDemo"}
	],
	create: function() {
		this.inherited(arguments);
		var imagePath = window.location.href.slice(0, -("index.html".length));
		if (imagePath.substr(0, "file://".length) === "file://") {
			imagePath = imagePath.slice("file://".length);
		}
		this.$.printDialog.setImagePath(imagePath);
	},
	imageViewerSnap: function(inSender, inValue) {
		this.currentImage = inValue;
	},
	printImageButtonClick: function() {
		var selectedImage = this.largeImages[this.currentImage];
		this.$.printDialog.setImagesToPrint([selectedImage]);
		this.$.printDialog.openAtCenter();
	},
	printAllImagesButtonClick: function() {
		this.$.printDialog.setImagesToPrint(this.largeImages);
		this.$.printDialog.openAtCenter();
	}
});

/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "DrawImage.control", 
	kind: enyo.Control,
    nodeTag: "canvas",
    domAttributes: { 
    	width:"300px", 
    	height:"300px", 
    	style: "border: 2px solid #000;"
	},
	// After the canvas is rendered
	rendered: function() {
		// Fill in the canvas node property
		this.hasNode();
		
		var can = this.node;
		var c = can.getContext('2d');
		 
		var img = new Image();
		img.onload = function() {
		    c.drawImage(img, 20, 20);
		}
		img.src = 'images/mail-256x256.png';
	}
});

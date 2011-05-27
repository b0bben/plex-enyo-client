/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "Layers.control", 
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
		c.lineWidth = 10;
		
		// Yellow head
		c.strokeStyle = "#000000";
		c.fillStyle = "#FFFF00";
		c.beginPath();
		c.arc(140, 140, 100, 0, Math.PI*2, true);
		c.closePath();
		c.stroke();
		c.fill();
		
		// Left eye
		c.fillStyle = "#000000";
		c.beginPath();
		c.arc(100, 120, 10, 0, Math.PI*2, true);
		c.closePath();
		c.stroke();
		c.fill();
		
		// Right eye
		c.fillStyle = "#000000";
		c.beginPath();
		c.arc(180, 120, 10, 0, Math.PI*2, true);
		c.closePath();
		c.stroke();
		c.fill();
		
		// Mouth
		c.moveTo(85, 180);
		c.bezierCurveTo(95, 220, 185, 220, 195, 180);
		c.strokeStyle = "#000000";
		c.stroke();
	}
});

/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "BezierCurve.control", 
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
		
		c.moveTo(40, 140);
		c.bezierCurveTo(40, 10, 250, 10, 250, 140);
		 
		c.lineWidth = 5;
		c.strokeStyle = "#FF9900";
		c.stroke();
	}
});

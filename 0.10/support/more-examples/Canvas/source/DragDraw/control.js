/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "DragDraw.control", 
	kind: enyo.Control,
    nodeTag: "canvas",
    domAttributes: { 
    	width:"300px", 
    	height:"300px", 
    	style: "border: 2px solid #000;"
	},
	mousemoveHandler: function(inSender, e) {
		if ( (this.owner.dragging) && (this.hasNode()) ) {
			
		    var can = this.node;  
		    var c = can.getContext('2d');
		    c.fillStyle = "blue";
		    c.fillRect(e.offsetX,e.offsetY,10,10);	        
    	}
	}
});

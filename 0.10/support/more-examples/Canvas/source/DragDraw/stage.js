/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "DragDraw.stage",
	kind: HeaderView,
	components:[
        { kind: "PageHeader", content: "Drag your finger in the box below to draw", flex: 0, style: "font-size: 16px" },
        { kind: "DragDraw.control", ondragstart: "itemDragStart", ondragfinish: "itemDragFinish" }
    ],
    itemDragFinish: function(inSender, e) {
		this.dragging = false;
	},
    itemDragStart: function(inSender, e) {
		this.dragging = true;
	}
});
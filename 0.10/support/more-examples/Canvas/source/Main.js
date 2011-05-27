/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "Main",
	kind: enyo.VFlexBox,
	events: {
		onItemSelected: "",
	},
	components: [
		{kind: "FadeScroller", flex: 1, components: [
			{defaultKind: "ViewItem", components: [
				{kind: "Divider", caption: "Drawing"},
				{className: "enyo-first", onSelected:'itemSelected', viewKind: "BasicDrawing.stage", title: "Basic Drawing",
					description: "A basic canvas drawing"},
				
				{onSelected:'itemSelected', viewKind: "DrawImage.stage", title: "Drawing Images",
					description: "Draw an image to the canvas"},
					
				{viewKind: "BezierCurve.stage",
					onSelected:'itemSelected',
					title: "Drawing Bezier Curves",
					description: "Curve it. Curve it real good."},
				
				{className: "enyo-last", onSelected:'itemSelected', viewKind: "Layers.stage", title: "Layering Lines",
					description: "When one line just isn't enough"},

				{kind: "Divider", caption: "Interact"},
				{className: "enyo-first", onSelected:'itemSelected', viewKind: "DragDraw.stage", title: "Drag & Draw",
					description: "Draw your own picture"}
				
			]}
		]}
	],	
	itemSelected: function(inSender, inEvent){
		this.doItemSelected(inEvent)
	}
});

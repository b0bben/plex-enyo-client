/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "BasicDrawing.stage",
	kind: HeaderView,
	components:[
        { kind: "PageHeader", content: "140px square drawn on a canvas", flex: 0, style: "font-size: 16px" },
        { kind: "BasicDrawing.control" }
    ]
});
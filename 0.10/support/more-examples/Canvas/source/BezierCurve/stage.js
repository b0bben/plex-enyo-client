/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "BezierCurve.stage",
	kind: HeaderView,
	components:[
        { kind: "PageHeader", content: "Bezier Curve", flex: 0, style: "font-size: 16px" },
        { kind: "BezierCurve.control" }
    ]
});
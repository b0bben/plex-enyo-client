/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
    name: "Simple",
    kind: enyo.VFlexBox,
    components:[
        {kind:"Header", content:"Simple Multitouch Example"},
        
        //this is a div
        { 
            name:"mtouch",
            id:"mtouch",
            flex: 1, content: "touch here with multiple fingers",
            /*
            //these don't work yet. uncomment once enyo supports multitouch
            ontouchstart: "doTouchStart",
            ontouchmove: "doTouchMove",
            ontouchend: "doTouchEnd",
            */
        },
        
    ],

    //this is a hack because enyo doesn't wrap touch events yet.    
    rendered: function() {
        this.$.mtouch.hasNode();
        this.$.mtouch.node.ontouchstart = this.doTouchStart;
        this.$.mtouch.node.ontouchmove = this.doTouchMove;
        this.$.mtouch.node.ontouchend = this.doTouchEnd;
    },
    
    doTouchStart: function() {
        this.innerHTML = "touch start";
    },
    
    doTouchMove: function(e) {
        var str = "";
        for(var i=0; i<e.targetTouches.length; i++) {
            var touch = e.targetTouches[i];
            str += "touch "+i+"  "
                +touch.clientX+","
                +touch.clientY+"<br/>";
        }
        this.innerHTML = "touch move: touchcount = "
            + e.targetTouches.length
            +"<br/>"+str;
    },
    
    doTouchEnd: function() {
        this.innerHTML = "touch end";
    },
});

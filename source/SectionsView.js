/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "plex.SectionsView",
	kind: "VFlexBox",
	className: "enyo-bg",
	published: {
		headerContent: "",
		parentMediaContainer: ""
	},
	events: {
		onGo: ""
	},
	components: [
		{name: "header", kind: "Header", content: "Library sections", className: "enyo-header-dark"},
		{kind: "Scroller", flex: 1, components: [
			{name: "c_section_list", kind: "VirtualRepeater",flex: 1,onSetupRow: "setupRowItems", components: [
                  {kind: "Item", layoutKind: "VFlexLayout", onclick: "rowSelected",Xonmousedown: "rowSelected", components: [
                       {name: "c_section_button",kind: "plex.ButtonMenu"}
                      ]
                  }
              ]}
		]},
		{kind: "Toolbar"}
	],
	create: function() {
		this.inherited(arguments);
		this.headerContentChanged();
		this.parentMediaContainerChanged();
	},
	headerContentChanged: function() {
		//this.$.header.setContent(this.headerContent);
	},
	parentMediaContainerChanged: function() {
		this.$.c_section_list.render();
	},
	setupRowItems: function(inSender, inIndex) {
		this.log("ritar sektioner");
		var pmo = this.getParentMediaContainer();
	    var r = pmo.Directory[inIndex];
	    if (r) {
	        this.$.c_section_button.setHeaderContent(r);
	        //this.$.description.setContent(r.description);
	        return true;
	    }
	},
	rowSelected: function(inSender, inEvent) {
	    this.log("The user clicked on item number: " + inEvent.rowIndex);
	    this.log("sender: " + inSender + ", parent: " + inSender.owner.owner);
	    var mainView = inSender.owner.owner;
	    mainView.showGridView(inEvent.rowIndex);
	}
});

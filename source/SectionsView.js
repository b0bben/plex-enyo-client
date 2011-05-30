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
		{name: "header", kind: "Header",style: '-webkit-box-align: center !important',pack: 'center', className: "enyo-header-dark", components: [
			{kind: "Image", src: "images/PlexTextLogo.png", style: "padding: none;"}
		]},
		{kind: "Scroller", flex: 1, components: [
			{name: "c_section_list", kind: "VirtualRepeater",flex: 1, className: "section-list",onSetupRow: "setupRowItems", components: [
                  {kind: "Item", layoutKind: "VFlexLayout", style: "border-top:none;",onclick: "rowSelected",Xonmousedown: "rowSelected", components: [
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
		this.objCurrNavItem = "";
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
		

		var classes1 = inSender.getClassName();
		
		if (this.objCurrNavItem == inSender) {
			this.log("same shit ju!")
		}
		if(this.objCurrNavItem)
		{
			var classes = this.objCurrNavItem.getClassName();
		
			this.objCurrNavItem.removeClass("active");
			//this.$.c_section_list.render();
		}
		
		inSender.addClass("active");
		
		this.objCurrNavItem = inSender;
	}
});

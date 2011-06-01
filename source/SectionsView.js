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
		{name: "c_section_list", kind: "VirtualList",flex: 1, className: "section-list",onSetupRow: "setupRowItems", components: [
        {kind: "Item", layoutKind: "VFlexLayout", style: "border-top:none;",onclick: "rowSelected",Xonmousedown: "rowSelected", components: [
             {name: "c_section_button",kind: "plex.ButtonMenu"}
            ]
        }
            ]},
		{kind: "Selection"},		
		{kind: "Toolbar"}
	],
	create: function() {
		this.inherited(arguments);
		this.headerContentChanged();
		this.parentMediaContainerChanged();
		this.objCurrNavItem = "";
		this.selectedRow = -1;
	},
	headerContentChanged: function() {
		//this.$.header.setContent(this.headerContent);
	},
	parentMediaContainerChanged: function() {
		this.$.c_section_list.refresh();
	},
	setupRowItems: function(inSender, inIndex) {
		this.log("ritar sektioner");
		
    // check if the row is selected
    // color the row if it is
    //if (inIndex == this.selectedRow) {
      this.$.item.addRemoveClass("active", (inIndex == this.selectedRow));
      //this.$.item.applyStyle('background', 'url(images/list-highlight.png) no-repeat');
		//}
		
		var pmo = this.getParentMediaContainer();
	    var r = pmo.Directory[inIndex];
	    if (r) {
	        this.$.c_section_button.setHeaderContent(r);
	        //this.$.description.setContent(r.description);
	        return true;
	    }
	},
	rowSelected: function(inSender, inEvent) {
    this.selectedRow = inEvent.rowIndex;
    //this.$.c_section_list.refresh();
    
    this.log("The user clicked on item number: " + inEvent.rowIndex);
    this.log("sender: " + inSender + ", parent: " + inSender.owner.owner);
    var mainView = inSender.owner.owner;
    mainView.showGridView(inEvent.rowIndex);
    
   this.$.c_section_list.refresh();
  },
 });

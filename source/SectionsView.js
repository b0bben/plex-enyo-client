enyo.kind({
	name: "plex.SectionsView",
	kind: "VFlexBox",
	className: "enyo-bg",
	published: {
		headerContent: "",
		parentMediaContainer: undefined,
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
		{kind: "Toolbar", components: [
		  {kind: "Button", caption: "Show App Menu", onclick: "openAppMenu"},
		]}
	],
	create: function() {
		this.inherited(arguments);
		this.headerContentChanged();
		this.parentMediaContainerChanged();
		this.objCurrNavItem = "";
		this.listedSections = [];
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
    	this.$.item.addRemoveClass("active", (inIndex == this.selectedRow));
      
		if (this.parentMediaContainer !== undefined && this.parentMediaContainer.length > 0) {
	    	for (var i = this.parentMediaContainer.length - 1; i >= 0; i--){
	    		var mediaObj = this.parentMediaContainer[i]
				var r = mediaObj.pmo.MediaContainer.Directory[inIndex];
		    	if (r) {
		        	this.$.c_section_button.setHeaderContent(r);
		
		        	//we need the server all the goddamn time, so keep another list so we can act onclick on rows
					//grid will need to know which server we're talking about
					var sectionAndServer = {section: r, server: mediaObj.server};
		        	this.listedSections.push(sectionAndServer);
					return true;
		    	}

	    	};
		}
		return false;
	},
	rowSelected: function(inSender, inEvent) {
    	this.selectedRow = inEvent.rowIndex;
    	//this.$.c_section_list.refresh();
    
    	this.log("The user clicked on item number: " + inEvent.rowIndex);
    	this.log("sender: " + inSender + ", parent: " + inSender.owner.owner);
    	var mainView = inSender.owner.owner;
    	mainView.showGridView(this.listedSections[this.selectedRow]);
    
   		this.$.c_section_list.refresh();
  },
  openAppMenu: function() {
      this.owner.$.appMenu.open();
  },
 });

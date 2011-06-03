enyo.kind({
	name: "plex.EmptyToaster", 
  kind: enyo.Toaster, 
  flyInFrom: "right",
  className: "enyo-bg enyo-toaster enyo-popup-float",
  style: "top: 0px; bottom: 0px",
  width: "800px",
  lazy: false,
  scrim: false,
  components: [
  	{name: "shadow", className: "enyo-sliding-view-shadow"},
  	{kind: "VFlexBox", height: "100%", components: [
  		{name: "client", flex: 1, layoutKind: "VFlexLayout"},
  		{kind: "Toolbar", align: "center", components: [
  			{name: "dragHandle", kind: "GrabButton", onclick: "close"}
  		]}
  	]}
  ],
  create: function() {
 		this.inherited(arguments);
  }
})
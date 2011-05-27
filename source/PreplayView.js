enyo.kind({
	name: "plex.PreplayView",
	kind: enyo.Toaster,
	events: {
		onBypassClose: ""
	},
	published: {
		plexMediaObject: "",
		relatedMedia: []
	},
	lazy: true,
	flyInFrom: "right",
	className: "enyo-bg", 
	components: [
		{name: "shadow", className: "enyo-sliding-view-shadow"},
		{kind: "VFlexBox", flex: 1, components: [
			{name: "AllDetails", className: "details", kind: "Scroller", horizontal: false, autoHorizontal: false, showing: true, flex: 1, components: [
					{kind: "Control", className: "container", components: [
						{kind: "Control", className: "content", components: [
							{kind: "HFlexBox", className: "header", components: [
								{name: "photo", kind: "Control", className: "avatar", components: [
									{name: "photoImage", className: "img", kind: "Control"},
									{kind: "Control", className: "mask"}
								]},
								{kind: "Control", layoutKind: "VFlexLayout", flex: 1, pack: "justify", align: "end", components: [
									{name: "favIndicator", kind: "Control", className: "favorite", onclick: "toggleFavorite"},
									{kind: "Control", layoutKind: "VFlexLayout", className: "nameinfo", align: "start", components: [
										{name: "title", className: "name", content: "Family Guy - Blue Harvest"},
										{name: "nickname", className: "nickname", content: "blahaha nickname"},
										{name: "desc", className: "position", content:"long ass decsro"}
									]},
								]}
							]},
						]}
					]}
		//			{style: "height: 48px;"}
			]},
		]},
		{kind: "Toolbar"}
	],
	create: function() {
		this.inherited(arguments);
		this.plexMediaObjectChanged();
		
		//this.$.title.setContent(this.plexMediaObject.title);
		//this.$.desc.setContent(this.plexMediaObject.summary);
		//this.$.nickname.setContent(this.getNickName(this.person));


		//this.$.photoImage.applyStyle("background-image", "url(" + this.plexMediaObject.thumb + ");");

	},
	plexMediaObjectChanged: function() {
		this.log("preplay with: " + this.plexMediaObject.title);
	},
	close: function(e, reason) {
		if (!this.doBypassClose(e)) {
			this.inherited(arguments);
		}
	}
})

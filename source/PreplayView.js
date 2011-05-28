enyo.kind({
	name: "plex.PreplayView", 
	kind: enyo.Toaster, 
	scrim: true, 
	scrimClassName: "transparent-scrim", 
	flyInFrom: "right", 
	style: "top: 0px; bottom: 0px", 
	lazy: false,
	published: {
		plexMediaObject: "",
	},
	components: [
		{className: "enyo-sliding-view-shadow"},
		{kind: enyo.VFlexBox, flex: 1, width: "320px", height: "100%", components: [
			{kind: "Header", className: "enyo-header-dark", components: [
				{kind: "RadioGroup", flex: 1, components: [
					{kind: "RadioButton", value: "bookmarks", className: "enyo-radiobutton-dark", icon: "images/chrome/toaster-icon-bookmarks.png", onclick: "showBookmarks"},
					{kind: "RadioButton", value: "history", className: "enyo-radiobutton-dark", icon: "images/chrome/toaster-icon-history.png", onclick: "showHistory"},
					{kind: "RadioButton", value: "downloads", className: "enyo-radiobutton-dark", icon: "images/chrome/toaster-icon-downloads.png", onclick: "showDownloads"}
				]}
			]},
			{name: "drawerPane", kind: "Pane", flex: 1, lazyViews: [
				{name: "bookmarks", kind: "BookmarkList",
					onSelectItem: "selectItem",
					onEditItem: "showEditBookmarkDialog",
					onDeleteItem: "deleteBookmark",
					onAddBookmark: "addBookmark",
					onClose: "closeToaster"
				},
				{name: "history", kind: "HistoryList",
					onSelectItem: "selectItem",
					onDeleteItem: "deleteHistory",
					onClose: "closeToaster",
				},
				{name: "downloads", kind: "DownloadList",
					onOpenItem: "openDownloadedFile",
					onCancelItem: "cancelDownload",
					onRetryItem: "retryDownload",
					onDeleteItem: "deleteDownload",
					onClearAll: "showClearDownloadsDialog",
					onClose: "closeToaster",
					onShow: "downloadListShown"
				}
			]},
			{kind: "Toolbar",components: [
				{kind: "GrabButton", onclick: "doClose"},
			]}
		]}

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
	doClose: function() {
		this.close();
	}
})
/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "widgets.ListSelectors",
	kind: HeaderView,
	components: [
		{kind: "RowGroup", components: [
			{layoutKind: "HFlexLayout", align: "center", components: [
				{content: "Status", className: "enyo-label", flex: 1},
				{kind: "ListSelector", items: [
					{caption: "Away", value: 1, icon: "images/status-away.png"},
					{caption: "Available", value: 2, icon: "images/status-available.png"},
					{caption: "Offline", value: 3, icon: "images/status-offline.png"}
				]},
			]},
			
			{layoutKind: "HFlexLayout", align: "center", components: [
				{content: "Search (Item hidden)", className: "enyo-label", flex: 1},
				{kind: "ListSelector", value: 3, hideItem: true, items: [
					{caption: "Google", value: 1},
					{caption: "Yahoo", value: 2},
					{caption: "Bing", value: 3}
				]},
			]},
			
			{layoutKind: "HFlexLayout", align: "center", components: [
				{content: "Method (Arrow hidden)", className: "enyo-label", flex: 1},
				{kind: "ListSelector", value: "im", hideArrow: true, items: [
					{caption: "Phone", value: "phone"},
					{caption: "Instant Messenger", value: "im"},
					{caption: "Email", value: "email"},
					{caption: "Conversation", value: "text"}
				]},
			]},
			
			{layoutKind: "HFlexLayout", align: "center", components: [
				{content: "Disabled", className: "enyo-label", flex: 1},
				{kind: "ListSelector", disabled: true, value: 1, items: [
					{caption: "Disabled", value: 1},
					{caption: "Enabled", value: 2}
				]},
			]},

			
			{layoutKind: "HFlexLayout", align: "center", components: [
				{content: "List selector inside a button", className: "enyo-label", flex: 1},
				{kind: "Button", style: "padding: 0 8px; margin: 0;", components: [
					{kind: "ListSelector", value: 1, items: [
						{caption: "Google", value: 1},
						{caption: "Yahoo", value: 2},
						{caption: "Bing", value: 3}
					]}
				]}
			]},
			{layoutKind: "HFlexLayout", align: "center", components: [
					{kind: "ListSelector", popupAlign: "left", label: "List selector pops at left", hideItem: true, items: [
						{caption: "Google", value: 1},
						{caption: "Yahoo", value: 2},
						{caption: "Bing", value: 3}
				]},
				//{content: "List selector pops at left", className: "enyo-label", flex: 1},
			]},
		]}
	]
});
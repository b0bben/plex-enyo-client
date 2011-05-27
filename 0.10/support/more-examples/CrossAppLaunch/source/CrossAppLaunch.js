/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
    name: "CrossAppLaunch",
    kind: "VFlexBox",
	components: [
		
		{ kind: "PageHeader", content: "Cross App Source - App A" },
        { style:"margin:30px;", components:[
        	{ kind: "HtmlContent", content: "Type some text and press the button below to launch & pass an argument to the CrossAppTarget application.", style:"margin-bottom:30px;text-align:center;" },
        	{ kind: "RowGroup", caption: "Enter Text", components: [
		        { kind: "Input", value: "hello world", name: "sourceText" },
				{ kind: "Button", caption: "Push Value to CrossAppTarget >>", onclick: "buttonClick", className: "enyo-button-dark" }
		    ]}
        ]},
		{ kind: "CrossAppUI", name: "crossApp", onResult: "handleResult", showing: false }
	],
	rendered: function() {
		this.inherited(arguments);
		this.$.sourceText.forceFocus();
	},
	buttonClick: function(inSender) {
		
		// Set the appID of the app we want to push
		this.$.crossApp.setApp("com.palmdts.crossapptarget");
		
		// Set the path to the .html file we want to target within the app we push
		/*
			// We can perform device/emulator-based development by using the following
			this.$.crossApp.setApp("com.palmdts.crossapptarget");
			this.$.crossApp.setPath("index.html");
			*
			// We can also perform browser-based development by omitting the call to setApp()
			// and just use setPath() and target the location of our local app's index.html
			this.$.crossApp.setPath("../CrossAppTarget/index.html");
		*/
		this.$.crossApp.setPath("index.html");
		
		// Capture the user data
		var val = this.$.sourceText.getValue();
		
		// Set val as a parameter to be passed to our pushed application
		this.$.crossApp.setParams({ textValue: val });
		
		// Display our pushed application
		this.$.crossApp.setShowing(true);
	},
	// Captures data from our pushed application
	handleResult: function(inSender, inResponse) {
		this.$.sourceText.setValue(inResponse.result);
		this.$.crossApp.setShowing(false);
		this.$.sourceText.forceFocus();
	}
});

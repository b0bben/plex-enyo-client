/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
    name: "Main.CrossAppLaunch",
    kind: "Scroller",
    components:[
        { kind: "PageHeader", content: "Cross App Target - App B" },
        { style:"margin:30px;", components:[
			{ name: "alert", style:"margin-bottom:30px;text-align:center;" },
        	{ kind: "RowGroup", caption: "Text captured from Cross-App Source - App A", components: [
		        { kind: "Input", hint: "", value: "", name: "targetText" },
		        { kind: "Button", caption: "<< Push Value Back to CrossAppSource", onclick: "buttonClick", className: "enyo-button-dark" }
		    ]}
        ]},
        {kind: "CrossAppResult"}
    ],
	buttonClick: function() {
		// Capture the user data
		var val = this.$.targetText.getValue();
		// Set val as a parameter to be passed back to our source application
		this.$.crossAppResult.sendResult({ result: val });
	},
    // called when app is opened or reopened
    windowParamsChangeHandler: function() {
    	// capture any parameters associated with this app instance
    	var params = enyo.windowParams;
		
		// If app is opened directly, we don't have any parameters ... thus, no source app to go back to
		if (params.textValue === undefined) {
			this.$.alert.setContent("You really should launch me from within CrossAppSource.<br />I'm pretty worthless otherwise.<br />:)");
		} else {
			this.$.alert.setContent("Type some text and press the button below to go back & pass an argument to the CrossAppSource application.");
			this.$.targetText.setValue(params.textValue);
		}
		this.$.targetText.forceFocus();
    }
});

enyo.kind({
  name: "plex.Preferences",
  kind: enyo.VFlexBox,
  events: {
      onReceive: "",
      onSave: "",
      onCancel: ""
  },
  components: [
      {kind: "PageHeader", content: "Enyo FeedReader - Preferences"},
      {name: "preferencesService", kind: "enyo.SystemService"},
      {kind: "VFlexBox",
          components: [
              {kind: "RowGroup", caption: "Default Feed", components: [
                  {name: "defaultFeedInput", kind: "Input"}
              ]},
              {kind: "HFlexBox", pack: "end", style: "padding: 0 10px;",
                  components: [
                      {name: "saveButton", kind: "Button",
                          content: "Save", onclick: "saveClick"},
                      {width: "10px"},
                      {name: "cancelButton", kind: "Button",
                          content: "Cancel", onclick: "cancelClick"}
                  ]
              }
          ]
      },
  ],
  create: function() {
      this.inherited(arguments);
      this.$.preferencesService.call(
      {
          keys: ["defaultFeed"]
      },
      {
          method: "getPreferences",
          onSuccess: "gotPreferences",
          onFailure: "gotPreferencesFailure"
      });
      // keep this updated with the value that's currently saved to the service
      this.savedUrl = "";
  },
  gotPreferences: function(inSender, inResponse) {
      this.savedUrl = inResponse.defaultFeed;
      this.$.defaultFeedInput.setValue(this.savedUrl);
      this.doReceive(this.savedUrl);
  },
  gotPreferencesFailure: function(inSender, inResponse) {
      console.log("got failure from preferencesService");
  },
  showingChanged: function() {
      // reset contents of text input box to last saved value
      this.$.defaultFeedInput.setValue(this.savedUrl);
  },
  saveClick: function(inSender, inEvent) {
      var newDefaultFeedValue = this.$.defaultFeedInput.getValue();
      this.$.preferencesService.call(
      {
          keys: {
              "defaultFeed": newDefaultFeedValue
          }
      },
      {
          method: "setPreferences"
      });
      this.savedUrl = newDefaultFeedValue;
      this.doSave(newDefaultFeedValue);
  },
  cancelClick: function() {
      this.doCancel();
  }
});
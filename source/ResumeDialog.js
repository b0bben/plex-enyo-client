enyo.kind({
    name: "plex.ResumeDialog",
    kind: enyo.Control,
    events: {
        onResume: "",
        onFromStart: ""
    },
    published: {
      resumeOffset: "",  
    },
    width: "400px",   // default width
    height: "auto",   // default height
    components: [
        { name: "box", kind: enyo.Popup, lazy: false, showHideMode: "transition", openClassName: "enyo-msgBox-animEnd",
          className: "enyo-msgBox-animStart", layoutKind: "VFlexLayout",
          components: [
              { name: "msgArea", content: " ", className: "enyo-msgBox-msgArea" },
              { kind: "HFlexBox", className: "enyo-msgBox-btnArea",
                components: [
                    { name: "paddingLeft", flex: 1 },
                    { kind: "Button", name: "resumeButton", onclick: "resumeChosen" },
                    { kind: "Button", name: "fromStartButton", onclick: "fromStartChosen", caption: $L("Play from the start") },
                    { name: "paddingRight", flex: 1 }
                ]
              }
          ]
       }
    ],
    create: function (cfg) {
        this.inherited(arguments);
        var dimArr = [], dimStyle = null;
        if (this.width || this.height) {
            if (this.width)  { dimArr.push("width:"+this.width); }
            if (this.height) { dimArr.push("height:"+this.height); }
            dimStyle = dimArr.join(";")+";";
            this.$.box.addStyles(dimStyle);
        }
        this.message && this.setMessage(this.message);
        this.resumeOffsetChanged();
    },
    setMessage: function (text) {
        this.$.msgArea.setContent(text);
    },
    resumeOffsetChanged: function () {
        this.$.resumeButton.setCaption($L("Resume from ") + this.resumeTimeForDisplay() );
    },
    openAtCenter: function () {
        this.$.box.openAtCenter();
    },
    resumeChosen: function (inSender, ev) {
        this.doResume();
        this.$.box.close();
    },
    fromStartChosen: function (inSender, ev) {
        this.doFromStart();
        this.$.box.close();
    },
    resumeTimeForDisplay: function() {
        var x = this.resumeOffset / 1000;
        var secs = Math.floor(x % 60);
        x /= 60;
        var mins = Math.floor(x % 60);
        x /= 60;
        var hrs = Math.floor(x % 24);
        var finalCaption = "";
        if (hrs > 0) {
          finalCaption += hrs.leftZeroPad(1) + ":";
        }

        finalCaption += mins.leftZeroPad(2) + ":";
        finalCaption += secs.leftZeroPad(2);

        return finalCaption;
  },
});

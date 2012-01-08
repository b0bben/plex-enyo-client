enyo.kind({
    name: "plex.VideoObjectView",
  kind: "VFlexBox",
  title: "Inline Video",
  published: {
    videoSrc: undefined,
  },
  components:[
        {kind: "HtmlContent", name: "videoPlayer", srcId: "videoContainer"},
        
        {kind: "Divider", caption: "Screen Width"},
        {kind: "HFlexBox", components: [
          {kind: "Button", caption: "50%", onclick: "ChangeVideoWidth"},
          {kind: "Button", caption: "100%", onclick: "ChangeVideoWidth"}
        ]}
    ],
    rendered: function() {

      
    },
    videoSrcChanged: function(){
            this.video = document.getElementById('myHtml5Video');
      this.playPause = document.getElementById('playPause');
      this.seekShit = document.getElementById('seekShit');
      var that = this;
      
      this.playPause.addEventListener('click', function(e) {
          that.Play();
      }, false);

      this.seekShit.addEventListener('click', function(e) {
          that.Seek();
      }, false);


      this.video.src = this.videoSrc;
      this.video.play();
    },
    ChangeVideoWidth: function(inSender, inEvent) {
      var widthStyle = "width:" + inSender.caption + ";";
      this.$.videoPlayer.setStyle("width: 100%;height:100%;");
    },
    Play: function(inSender, inEvent) {
      if (this.video.paused == false) {
          this.video.pause();
          this.SetCaption("Play");
      } else {
          this.video.currentTime = "13.8139534883721";
          this.video.play();
          
          this.SetCaption("Pause");
      }
    },
    Seek: function(inSender,inEvent) {
      this.video.currentTime = 150;
    },
    Pause: function(inSender, inEvent) {
        this.video.pause();
        this.SetCaption("Play");
    },
    SetCaption: function(str) {
      this.playPause.innerText = str;
    }
});

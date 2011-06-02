enyo.kind({
  name: "PlexRequest",
	  constructor: function(callback) {
		this.callback = callback;
		var self = this;
		this.host = "http://mini-tv.local";
		this.port = "32400";
		this.baseUrl = this.host + ":" + this.port;
		this.plex_access_key = "";
	  },
	urlWithTranscoding: function(plexUrl) {
		var publicKey = "KQMIY6GATPC63AIMC4R2";
		var privateKey = decode64("k3U6GLkZOoNIoSgjDshPErvqMIFdE0xMTx8kgsrhnC0=");
		var time = Math.round(new Date().getTime() / 1000);
		
		var url = plexUrl+"@"+time;
		this.log("encoding url: " + url);
		HMAC_SHA256_init(privateKey);
		HMAC_SHA256_write(url);
		var mac = HMAC_SHA256_finalize();
		url = encode64(array_to_string(mac));
		
		this.log("X-Plex-Access-Key=" + publicKey);
		this.log("X-Plex-Access-Time=" + time);
		this.log("X-Plex-Access-Code=" + url);
		
		
		
	},
	dataForUrl: function(plexUrl) {
		 var url = this.host + ":" + this.port + plexUrl;
		 var xml = new JKL.ParseXML(url);
		 xml.async(enyo.bind(this,"processPlexData"));
		 xml.parse();	
	},
	
	processPlexData: function(data) {
		var pmc = data.MediaContainer;
		this.callback(pmc);	
	},
	
	librarySections: function() {
		var url = "/library/sections/";
		this.dataForUrl(url);
	},
	
	getSectionForKey: function(key,level) {
		level = level || "all"
		var url = "/library/sections/" + key + "/" + level;
		this.dataForUrl(url);
		
	},
	getFullUrlForPlexUrl: function(url) {
	  return this.baseUrl + url;
	}
});
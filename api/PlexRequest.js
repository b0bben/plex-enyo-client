enyo.kind({
	name: "PlexServer",
	constructor: function(machineIdentifier,name,host,port,username,password,include, owned, accessToken) {
		this.name = name;
		this.host = host;
		this.port = port;
		this.machineIdentifier = machineIdentifier;
		this.username = username;
		this.password = password;
		this.include = include;
		this.owned = owned;
		this.accessToken = accessToken;
		this.baseUrl = "http://" + this.host + ":" + this.port;
	},
	
})
enyo.kind({
  name: "PlexRequest",
  kind: enyo.Component,
  constructor: function(callback) {
	  this.inherited(arguments);
		this.callback = callback;
		var self = this;
		this.servers = [];
		this.myplexServers = [];
		this.videoQuality = "8";
		this.plex_access_key = "";
		this.prefs = undefined;
		this.loadPrefsFromCookie();
  },
	loadPrefsFromCookie: function() {
		var prefCookie = enyo.getCookie("prefs");
		
		if (prefCookie) {
			// mixin will use the cookie value of the pref
			// if it exists, else use the default
			this.prefs = enyo.mixin(this.prefs, enyo.json.parse(prefCookie));
			this.log("loaded prefs: " + enyo.json.stringify(this.prefs));
			this.servers = this.prefs.servers;
			this.myplexServers = this.prefs.myplexServers;
			this.myplexUser = this.prefs.myplexUser;
			this.videoQuality = this.prefs.videoQuality;
		}
	},
	savePrefs: function() {
		this.prefs = {
			servers: this.servers,
			myplexServers: this.myplexServers,
			myplexUser: this.myplexUser,
			videoQuality: this.videoQuality,
		};
	  enyo.setCookie("prefs", enyo.json.stringify(this.prefs));
	  this.log("saved prefs: " + enyo.json.stringify(this.prefs));
	},
	serverForUrl: function(serverUrl) {
	  this.loadPrefsFromCookie(); //refresh list of servers incase we've added some without saving
	  for (var i = 0; i < this.servers.length; i++) {
	    if (this.servers[i].host == serverUrl)
	      return this.servers[i];
	  }
	  return null;
	},
	transcodeUrlForVideoUrl: function(pmo, server, videoUrl) {
	  //Step 1: general transcoding URL + server URL
	  var transcodingUrl = "/video/:/transcode/segmented/start.m3u8";
	  var fakeUrl = "http://localhost:32400"
	  //Step 2: transcoding url + url to video object
	  var targetUrl = transcodingUrl + "?url=" + encodeURIComponent(fakeUrl + videoUrl);
	  //Step 3: add subtitle size
	  //targetUrl += "&subtitleSize=" + 100 //TODO: get from settings
	  //Step 4: add audioboost
	  targetUrl += "&audioBoost=" + 100 //TODO: get from settings
	  //step 5: rating key
	  targetUrl += "&ratingKey=" + pmo.ratingKey;
	  //step 6: identifier
	  targetUrl += "&identifier=" + "com.plexapp.plugins.library"; //TODO: get from somewhere...
	  //step 7: quality
	  targetUrl += "&quality=" + 6; //TODO: get from settings
	  //step 8: key
	  targetUrl += "&key=" + encodeURIComponent(fakeUrl + pmo.key);
	  targetUrl += "&session=" + 1111;//enyo.fetchDeviceInfo().serialNumber;
	  //step 9: 3G flag
	  targetUrl += "&3g=0" //no 3G on teh touchpad
	  
	  //there's no step 9! 
	  targetUrl += this.authWithUrl(targetUrl);
	  
	  targetUrl += "&X-Plex-Client-Capabilities=" + encodeURIComponent("protocols=http-live-streaming,http-mp4-streaming,http-streaming-video,http-streaming-video-720p,http-mp4-video,http-mp4-video-720p;videoDecoders=h264{profile:baseline&resolution:720&level:30};audioDecoders=mp3,aac{bitrate:160000}");
	  
	  return server.baseUrl + targetUrl;
	  
	},
	authWithUrl: function(plexUrl) {
		var publicKey = "KQMIY6GATPC63AIMC4R2";
		var privateKey = decode64("k3U6GLkZOoNIoSgjDshPErvqMIFdE0xMTx8kgsrhnC0=");
		var time = Math.round(new Date().getTime() / 1000);
		
		var url = plexUrl+"@"+time;
		console.log("encoding url: " + url);
		HMAC_SHA256_init(privateKey);
		HMAC_SHA256_write(url);
		var mac = HMAC_SHA256_finalize();
		url = encode64(array_to_string(mac));
		console.log("access code before encoding: " + url);
		url = encodeURIComponent(url);
		
		console.log("X-Plex-Access-Key=" + publicKey);
		console.log("X-Plex-Access-Time=" + time);
		console.log("X-Plex-Access-Code=" + url);
		

		
		/* Remote server login stuff
		
		  X-Plex-User: name
		  X-Plex-Pass: SHA1(name + SHA1(pass))
		
		*/
		
		    return "&X-Plex-Access-Key=" + publicKey + "&X-Plex-Access-Time=" + time + "&X-Plex-Access-Code=" + url;
		
	},
	dataForUrlAsync: function(server,plexUrl) {
		//need both server AND url
		if (server !== undefined && plexUrl !== undefined) { 
			var url = server.baseUrl + plexUrl;
		 	var xml = new JKL.ParseXML(url);
		 	xml.async(enyo.bind(this,"processPlexData"));
		 	xml.parse();	
		}
		//got a complete url, usually via myplex
		else if (server === undefined && plexUrl !== undefined) { 
		 	var xml = new JKL.ParseXML(plexUrl);
		 	xml.async(enyo.bind(this,"processPlexData"));
		 	xml.parse();				
		}
	},
	
	dataForUrlSync: function(server,plexUrl) {
		if (server !== undefined && plexUrl !== undefined) { 
			try {
				var url = server.baseUrl + plexUrl;
		 		var xml = new JKL.ParseXML(url);
		 		var data = xml.parse();
				return data;
			} catch(e) {
				console.log("server unavailable: " + server.name);
				//TODO: error handling
			}
		}
	},

	// PMS START
	processPlexData: function(data) {
		var pmc = data.MediaContainer;
		this.callback(pmc);	
	},
	
	librarySections: function() {
		var url = "/library/sections/";
		var mediaObjs = [];
		for(var i=0; i < this.servers.length; i++) {
			var server = this.servers[i];
			if (server.include) {
				var pmo = this.dataForUrlSync(server,url);
				var mediaObj = {server: server,	pmo: pmo};

				//server is not available if pmo is null
				if (pmo !== undefined)
					mediaObjs.push(mediaObj);				
			}
		}
		this.callback(mediaObjs);
	},
	recentlyAdded: function() {
		var url = "/library/recentlyAdded";
		var mediaObjs = [];
		for(var i=0; i < this.servers.length; i++) {
			var server = this.servers[i];
			if (server.include) {
				var pmo = this.dataForUrlSync(server,url);
				var mediaObj = {server: server,	pmc: pmo.MediaContainer};

				//server is not available if pmo is null
				if (pmo !== undefined)
					mediaObjs.push(mediaObj);				
			}
		}
		this.callback(mediaObjs);
	},
	getSectionForKey: function(server,key,level) {
		var authToken = this.myplexUser["authentication-token"];
		level = level || "all"
		var url = key + "/" + level;
		if (authToken) {
			url += "?X-Plex-Token=" + authToken;
		}
		this.dataForUrlAsync(server,url);
		
	},
	getFiltersForSectionAndKey: function(server,key) {
		var url = "/library/sections/" + key;
		this.dataForUrlAsync(server,url);
	},
	getFullUrlForPlexUrl: function(server,url) {
	  return server.baseUrl + url;
	},
	getAssetUrl: function(server, asset_key) {
		var authToken = this.myplexUser["authentication-token"];
		var url = server.baseUrl + asset_key;
		if (authToken) {
			url += "?X-Plex-Token=" + authToken;
		}
		return url;
	},
	stopTranscoder: function(server) {
		if (server.hasOwnProperty("baseUrl")) {
			var url = "/video/:/transcode/segmented/stop";
			var response = this.dataForUrlSync(server,url);
			console.log("stopped transcoder, resp: " + response);
		}
	},


	// MYPLEX START
	make_base_auth: function(user, password) {
	  var tok = user + ':' + password;
	  var hash = encode64(tok);
	  return "Basic " + hash;
	},
	loginToMyPlex: function(user,pass) {
		var url = "https://my.plexapp.com/users/sign_in.xml";
		var auth = this.make_base_auth(user,pass);
		var headers = {"Authorization":auth, 
									"X-Plex-Product": "plex_webos", 
									"X-Plex-Version": "0.5.5",
									"X-Plex-Provides": "client",
									"X-Plex-Client-Identifier": "bob_test",
									"X-Plex-Platform": "webos",
									"X-Plex-Platform-Version": "3.0.4",
									"X-Plex-Device": "HP Touchpad" };
		
		var xml = new JKL.ParseXML(url,"","POST",headers);
		xml.async(enyo.bind(this,"processMyPlexLogin"));
		xml.parse();
		//var data = xml.parse();
		//return data;
	},
	processMyPlexLogin: function(data) {
		console.log("processMyPlexLogin: " + enyo.json.stringify(data));
		this.callback(data);
	},
	getMyPlexServers: function() {
		var authToken = this.myplexUser["authentication-token"];
	  var url = "https://my.plexapp.com/pms/servers?X-Plex-Token=" + authToken;
	  var xml = new JKL.ParseXML(url);
	 	xml.async(enyo.bind(this,"processMyPlexServers"));
	 	xml.parse();
	},
	processMyPlexServers: function(data) {
		//console.log("myplex servers: " + enyo.json.stringify(data));
		this.callback(data.MediaContainer);	
	},
	getMyPlexServerWithMachineId: function(machineid){
	  //this.loadPrefsFromCookie(); //refresh list of servers incase we've added some without saving
	  for (var i = 0; i < this.myplexServers.length; i++) {
	    if (this.myplexServers[i].machineIdentifier == machineid)
	      return this.myplexServers[i];
	  }
	  return null;		
	},
	myPlexSections: function() {
		if (this.myplexUser === undefined){
			this.callback(undefined); //nothing to see here, move along
			return;
		}
		var authToken = this.myplexUser["authentication-token"];
	  var url = "https://my.plexapp.com/pms/system/library/sections?X-Plex-Token=" + authToken;
  	var xml = new JKL.ParseXML(url);
	 	xml.async(enyo.bind(this,"processMyPlexSections"));
	 	xml.parse();
	},
	processMyPlexSections: function(data) {
		console.log(data);
		this.callback(data.MediaContainer);
	},
});
// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};
enyo.kind({
	name: "PlexServer",
	constructor: function(name,host,port,username,password,include) {
		this.name = name;
		this.host = host;
		this.port = port;
		this.username = username;
		this.password = password;
		this.include = include;
		this.baseUrl = this.host + ":" + this.port;
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
	this.plex_access_key = "";
	this.loadServerListFromCookie();
  },
	loadServerListFromCookie: function() {
		/*
		*	Server list cookie will be array of servers like this:
		*	{name:serverName,
			host:serverUrl,
			port:serverPort,
			user:username,
			pass:password,
			include: true};
		*/
		
		var prefCookie = enyo.getCookie("prefs");
		
		if (prefCookie !== undefined) {
			var prefs = enyo.json.parse(prefCookie);
			this.servers = [];
			for (var i = prefs.length - 1; i >= 0; i--){
				var serverAsJson = prefs[i];
				var plexServer = new PlexServer(serverAsJson.name,serverAsJson.host,serverAsJson.port,serverAsJson.username,serverAsJson.password,serverAsJson.include);

					this.servers.push(plexServer);
				
			};
			//this.log("loaded " + this.servers.length);
		}
	},
	savePrefs: function() {
	  enyo.setCookie("prefs", enyo.json.stringify(this.servers));
	},
	serverForUrl: function(serverUrl) {
	  this.loadServerListFromCookie(); //refresh list of servers incase we've added some without saving
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
	  targetUrl += "&quality=" + 8; //TODO: get from settings
	  //step 8: key
	  targetUrl += "&key=" + encodeURIComponent(fakeUrl + pmo.key);
	  targetUrl += "&session=" + 1111;//enyo.fetchDeviceInfo().serialNumber;
	  //step 9: 3G flag
	  targetUrl += "&3g=0" //no 3G on teh touchpad
	  
	  //there's no step 9! 
	  targetUrl += this.authWithUrl(targetUrl);
	  
	  targetUrl += "&X-Plex-Client-Capabilities=" + encodeURIComponent("protocols=http-live-streaming,http-mp4-video,http-mp4-video-720p;videoDecoders=h264{profile:main&resolution:720&level:30};audioDecoders=aac{bitrate:160000}");
	  
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
	loginSuccess: function(inSender, inResponse, inRequest) {
	    console.log("LOGIN SUCCESS: " + inResponse);
	},
	loginFailure: function(inSender, inResponse, inRequest) {
	    console.log("LOGIN FAIL: " + inResponse);
	},
	dataForUrlAsync: function(server,plexUrl) {
		if (server !== undefined && plexUrl !== undefined) { 
			var url = server.baseUrl + plexUrl;
		 	var xml = new JKL.ParseXML(url);
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
	
	getSectionForKey: function(server,key,level) {
		level = level || "all"
		var url = "/library/sections/" + key + "/" + level;
		this.dataForUrlAsync(server,url);
		
	},
	getFiltersForSectionAndKey: function(server,key) {
		var url = "/library/sections/" + key;
		this.dataForUrlAsync(server,url);
	},
	getFullUrlForPlexUrl: function(server,url) {
	  return server.baseUrl + url;
	}
});
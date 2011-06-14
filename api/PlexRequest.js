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
	  constructor: function(callback) {
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
			for (var i = prefs.length - 1; i >= 0; i--){
				var serverAsJson = prefs[i];
				var plexServer = new PlexServer(serverAsJson.name,serverAsJson.host,serverAsJson.port,serverAsJson.username,serverAsJson.password,serverAsJson.include);
				this.servers.push(plexServer);
			};
			//this.log("loaded " + this.servers.length);
		}
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
		
		/* Remote server login stuff
		
		  X-Plex-User: name
		  X-Plex-Pass: SHA1(name + SHA1(pass))
		
		*/
		
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
	getFullUrlForPlexUrl: function(server,url) {
	  return server.baseUrl + url;
	}
});
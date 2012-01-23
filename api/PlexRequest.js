var PlexServer = function(machineIdentifier,name,host,port,username,password,include, owned, accessToken, local) {
	this.name = name;
	this.host = host;
	this.port = port ? port : "32400";
	this.machineIdentifier = machineIdentifier;
	this.username = username;
	this.password = password;
	this.include = include;
	this.owned = owned;
	this.local = local === "1" ? true : false;
	this.accessToken = accessToken;
	this.online = false;

	if (this.host.match("^(https|http)")) {
		this.baseUrl = this.host + ":" + this.port;
	}
	else {
		this.baseUrl = "http://" + this.host + ":" + this.port;
	}
	this.collectMoreInfo = function() {
		if (this.baseUrl) {
			console.log("collecting more info about: " + this.baseUrl);
			try {
				var xml = new JKL.ParseXML(this.baseUrl);
				var data = xml.parse();
				this.gotServerResponse(data);				
			}
			catch (error)	{
				console.log("error when trying to reach server for info: " + error);
			}
		}
	},
	this.gotServerResponse = function(data) {
		if (data) {
			console.log("received server info: " + data.MediaContainer);
			if (data.MediaContainer.machineIdentifier) {
				this.machineIdentifier = data.MediaContainer.machineIdentifier;
			}
			if (this.name === undefined || this.name === "") {
				this.name = data.MediaContainer.friendlyName;
			}
		}
	},
	this.checkIfReachable = function() {
		var url = this.baseUrl;
		if (this.accessToken) {
			url += "?X-Plex-Token=" + this.accessToken;
		}
		console.log(url);
		var xml = new JKL.ParseXML(url);
		xml.async(enyo.bind(this,"reachCheckResponse"));
		xml.parse();
		
	};
	this.reachCheckResponse = function(data) {
		//console.log("reachabiliityCheckResp: " + data);
		if (data !== undefined) {
			this.online = true;
			console.log(data.MediaContainer.friendlyName + " is online and running version: " + data.MediaContainer.version);
			if (window.Metrix && !this.statsRegistered) {
				window.Metrix.customCounts("PMS", encodeURIComponent(data.MediaContainer.version), 1);
				window.Metrix.customCounts("PMS_PLATFORM", encodeURIComponent(data.MediaContainer.platform), 1);
				window.Metrix.customCounts("PMS_PLATFORM_VERSION", encodeURIComponent(data.MediaContainer.platformVersion), 1);
				this.statsRegistered = true;
			}
		}
		else {
			this.online = false;
			this.include = false;
			console.log(this.name + " is offline");
		}
	};

	//check (asyncl-y) if server is reachable at this point
	this.checkIfReachable();
	
	
}
enyo.kind({
  name: "PlexRequest",
  kind: enyo.Component,
  components: [
		{name: "browserBonjour", kind: "PalmService", service: "palm://com.palm.zeroconf/", method: "browse", subscribe: true, onSuccess: "gotBrowsed", onFailure: "genericFailure"},
		{name: "resolverBonjour", kind: "PalmService", service: "palm://com.palm.zeroconf/", method: "resolve", subscribe: true, onSuccess: "gotResolved", onFailure: "genericFailure"},
  ],
  create: function(callback) {
	  this.inherited(arguments);
		this.callback = callback;
		this.serversRefreshedCallback = undefined;
		this.myplexRefreshedCallback = undefined;
		this.localRefreshedCallback = undefined;
		var self = this;
		this.servers = [];
		this.myplexServers = [];
		this.localSections = [];
		this.myplexSections = [];
		this.foundBonjourServers = [];
		this.videoQuality = "6";
		this.plex_access_key = "";
		this.prefs = undefined;
		this.loadPrefsFromCookie();
		var thisInst = this;
		this.startReachabilityChecking();
  },
  stopReachabilityChecking:function() {
  	clearInterval(this.reachIntervalId);
  },
  startReachabilityChecking: function() {
  	this.reachIntervalId = setInterval(enyo.bind(this,"checkServerReachability"), 30000);
  },
  setCallback: function(callback){
  	this.callback = callback;
  },
  setMyPlexRefreshedCallback: function(callback) {
  	this.myplexRefreshedCallback = callback;
  },
  setLocalRefreshedCallback: function(callback) {
  	this.localRefreshedCallback = callback;
  },
  setServersRefreshedCallback: function(callback) {
  	this.serversRefreshedCallback = callback;
  },
	loadPrefsFromCookie: function() {
		var prefCookie = enyo.getCookie("prefs");
		
		if (prefCookie) {
			// mixin will use the cookie value of the pref
			// if it exists, else use the default
			this.prefs = enyo.mixin(this.prefs, enyo.json.parse(prefCookie));
			//this.log("loaded prefs: " + enyo.json.stringify(this.prefs));
			this.myplexUser = this.prefs.myplexUser;
			this.videoQuality = this.prefs.videoQuality;

			this.servers = [];
			this.myplexServers = [];
			//need to create PlexServer insatnces for reachability to work
			for (var item in this.prefs.myplexServers) {
				var serverObj = this.prefs.myplexServers[item];
				if (serverObj != null && serverObj.hasOwnProperty("host")) {
					var server = new PlexServer(serverObj.machineIdentifier,serverObj.name,serverObj.host,serverObj.port,serverObj.username,serverObj.password,serverObj.include,serverObj.owned,serverObj.accessToken,false);
					this.myplexServers.push(server);
				}
			};

			//need to create PlexServer insatnces for reachability to work
			for (var item in this.prefs.servers) {
				var serverObj = this.prefs.servers[item];
				if (serverObj != null && serverObj.hasOwnProperty("host")) {
					var server = new PlexServer(serverObj.machineIdentifier,serverObj.name,serverObj.host,serverObj.port,serverObj.username,serverObj.password,serverObj.include,serverObj.owned,serverObj.accessToken, true);
					this.servers.push(server);
				}
			};
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

	addServer: function(newServer) {
		if (newServer) {
			if (!this.urlIsInLocalServers(newServer.host)) {
				this.servers.push(newServer);

			this.savePrefs();
	    this.log("added server manually: " + newServer.name);

	    //refresh shit
			this.loadPrefsFromCookie();
			this.serversRefreshedCallback.call();
			this.librarySections();
			}
		}
	},

	//BONJOUR START
	searchNearbyServerWithBonjour: function() {
		this.log("looking for servers via bonjour...");
		this.$.browserBonjour.call({"regType":"_plexmediasvr._tcp", "domainName":"local."});
	},
	gotBrowsed: function(inSender, inResponse) {
	  if (inResponse.returnValue) {
	    //just a msg that it went well, skip it
	    return;
	  }
		this.log("BROWSE> " + JSON.stringify(inResponse.instanceName));

    //we've found something, let's resolve this to get some details about the machine
		this.$.resolverBonjour.call({"regType":inResponse.regType, "domainName":inResponse.domainName,
		                            "instanceName":inResponse.instanceName, "subscribe": true});
	},
	gotResolved: function(inSender, inResponse) {
  	if (inResponse.returnValue) {
	    //just a msg that it went well, skip it
  	  return;
  	}
	
		this.log("RESOLVE>: " + JSON.stringify(inResponse));

    //add found server to server list
    var serverName = inResponse.targetName;
    var serverUrl = "http://" + inResponse.IPv4Address; //no http included when found via bonjour
    var machineId = inResponse.textRecord[2].substring(18);
    var existingServer = this.getServerWithMachineId(machineId); //this.serverForUrl(serverUrl);
    if (!existingServer) {
    	this.foundBonjourServers.push({name: serverName, address: inResponse.IPv4Address, machineIdentifier: machineId});
    	serverUrl += ":32400/servers";
   		var xml = new JKL.ParseXML(serverUrl);
		 	xml.async(enyo.bind(this,"processLocalServerViaBonjour"));
		 	xml.parse();
	  	
    }
	},
	processLocalServerViaBonjour: function(data) {
		this.log();
		var foundServers = [];
		var addedNewServers = false;

		if (data.MediaContainer.size === "1") {
			foundServers.push(data.MediaContainer.Server);
		}
		else if (data.MediaContainer.size > 1) {
			foundServers = data.MediaContainer.Server;
		}

		this.log("found bonjour servers: " + this.foundBonjourServers.length);
  	for(var i=0; i < foundServers.length; i++){
  		var server = foundServers[i];
  
  		//servers found via bonjour and called for on windows are missing address sometimes, they suck!
	    if (!this.isInLocalServers(server.machineIdentifier) && server.address) {
	    	this.log("creating local plexserver: " + server.name + " host: " + server.address);
	    	var foundServer = new PlexServer(server.machineIdentifier,
	    				server.name,
    		  		server.address, 
    		  		server.port,
    		  		undefined,
    		  		undefined,
    		  		true,
    		  		"1",
    		  		undefined,
    		  		"1");		
	      this.servers.push(foundServer);
	      addedNewServers = true;
	    }
  	}

  	if (addedNewServers) {
	    this.savePrefs();
	    this.log("added bonjour server: " + server.name);

	    //refresh shit
			this.loadPrefsFromCookie();
			this.serversRefreshedCallback.call();
			this.librarySections();
  	}

	},
	genericFailure: function(inSender, inResponse) {
		this.log("failure: " + JSON.stringify(inResponse));
	},
	//END BONJOUR
	
	isInLocalServers: function(machineid){
	  //this.loadPrefsFromCookie(); //refresh list of servers incase we've added some without saving
	  for (var i = 0; i < this.servers.length; i++) {
	    if (this.servers[i].machineIdentifier === machineid)
	      return true;
	  }
	  return false;		
	},
	urlIsInLocalServers: function(url){
	  //this.loadPrefsFromCookie(); //refresh list of servers incase we've added some without saving
	  for (var i = 0; i < this.servers.length; i++) {
	    if (this.servers[i].host === url)
	      return true;
	  }
	  return false;		
	},
		
	serverForUrl: function(serverUrl) {
	  this.loadPrefsFromCookie(); //refresh list of servers incase we've added some without saving
	  for (var i = 0; i < this.servers.length; i++) {
	    if (this.servers[i].host == serverUrl)
	      return this.servers[i];
	  }
	  return null;
	},
	serverForMachineId: function(machineId) {
	  this.loadPrefsFromCookie(); //refresh list of servers incase we've added some without saving
	  for (var i = 0; i < this.servers.length; i++) {
	    if (this.servers[i].machineIdentifier == machineId)
	      return this.servers[i];
	  }
	  return null;
	},
	removeServerWithMachineId: function(machineId) {
	  for (var i = 0; i < this.servers.length; i++) {
	    if (this.servers[i].machineIdentifier == machineId)
	      this.servers.remove(this.servers[i]);
	      this.savePrefs();
	  }
	},
	removeServerWithHost: function(host) {
	  for (var i = 0; i < this.servers.length; i++) {
	    if (this.servers[i].host == host)
	      this.servers.remove(this.servers[i]);
	      this.savePrefs();
	  }
	},
	checkServerReachability: function() {
		var allServers = this.servers.concat(this.myplexServers);
		for (var i = 0; i < allServers.length; i++) {
			var server = allServers[i];
			server.checkIfReachable();
			this.log("started reachability check on " + server.name);
		};
	},
	getServerWithMachineId: function(machineid) {
		if (machineid !== undefined) {
			var allServers = this.servers.concat(this.myplexServers);
			for (var item in allServers) {
				var server = allServers[item];
				if (server.machineIdentifier === machineid) {
					return server;
				}
			}
		}
	},
	transcodeUrlForVideoUrl: function(pmo, server, videoUrl, offset) {
		var deviceInfo = enyo.fetchDeviceInfo();
		this.log("serialNumber: "+ deviceInfo.serialNumber);
		var session = deviceInfo ? deviceInfo.serialNumber : "1111";

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
	  targetUrl += "&quality=" + this.videoQuality;
	  //step 8: key
	  targetUrl += "&key=" + encodeURIComponent(fakeUrl + pmo.key);
	  targetUrl += "&session=" + session;
	  //step 9: 3G flag
	  targetUrl += "&3g=0" //no 3G on teh touchpad

	 	if (offset) {
	 		targetUrl += "&offset=" + pmo.viewOffset / 1000;
	 	}
	  
	  //there's no step 9! 
	  targetUrl += this.authWithUrl(targetUrl);
	  
	  targetUrl += "&X-Plex-Client-Capabilities=" + encodeURIComponent("protocols=http-live-streaming,http-mp4-streaming,http-streaming-video,http-streaming-video-720p,http-mp4-video,http-mp4-video-720p;videoDecoders=h264{profile:baseline&resolution:720&level:31};audioDecoders=aac{bitrate:160000}");
	  
	  return server.baseUrl + targetUrl;
	  
	},
	postProgressForVideo: function(server,key,timeInMs) {
		var deviceInfo = enyo.fetchDeviceInfo();
		this.log("serialNumber: "+ deviceInfo.serialNumber);
		var session = deviceInfo ? deviceInfo.serialNumber : "1111";
		
		if (server.baseUrl && key && timeInMs) {
			var url = "/:/progress?key="+ key + "&identifier=com.plexapp.plugins.library&time=" + timeInMs;
			var response = this.dataForUrlAsync(server,url);
			console.log("posting progress: " + timeInMs);
		}

	},
	stopTranscoder: function(server) {
		var deviceInfo = enyo.fetchDeviceInfo();
		this.log("serialNumber: "+ deviceInfo.serialNumber);
		var session = deviceInfo ? deviceInfo.serialNumber : "1111";
		
		if (server.hasOwnProperty("baseUrl")) {
			var url = "/video/:/transcode/segmented/stop?session=" + session;
			var response = this.dataForUrlSync(server,url);
			console.log("stopped transcoder, resp: " + response);
		}
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
			if (server.accessToken) {
				url += "?X-Plex-Token=" + server.accessToken;
			}
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
				if (server.accessToken) {
					url += "&X-Plex-Token=" + server.accessToken;
				}
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
		//this.log(pmc);
		this.callback(pmc,true);	
	},
	librarySections: function() {
		this.log();
		var url = "";
		var sectionsUrl = "/system/library/sections";
		var mediaObjs = [];
		for(var i=0; i < this.servers.length; i++) {
			var server = this.servers[i];
			
			url = server.baseUrl + sectionsUrl;
			if (server.online) {
				break;
			}
		}
		var xml = new JKL.ParseXML(url);
 		xml.async(enyo.bind(this,"processLocalSections"));
 		xml.parse();
	},
	processLocalSections: function(data) {
		this.log();
		this.localSections = [];
		if (data !== undefined && data.MediaContainer.Directory.length > 0) {
			for (var i = 0; i < data.MediaContainer.Directory.length; i++) {
				var item = data.MediaContainer.Directory[i];
				//if (!this.isInLocalSections(item)) {
					this.localSections.push(item);
				//} 
			};
		}
		this.localRefreshedCallback(this.localSections);
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
		level = level || "all"
		var url = key + "/" + level;
		this.dataForUrlAsync(server,url);
		
	},
	getFiltersForSectionAndKey: function(server,key) {
		var url = this.getAssetUrl(server,key);
		this.dataForUrlAsync(undefined,url);
	},
	getFullUrlForPlexUrl: function(server,url) {
	  return server.baseUrl + url;
	},
	getAssetUrl: function(server, asset_key) {
		var url = "";
		
		//myplex url with server + key
		if (asset_key.startsWith("http")) {
			url = asset_key;
		} else {
			url = server.baseUrl + asset_key;
		}

		if (server.accessToken) {
			var hasManyParams = url.match("(&)");
			if (hasManyParams) {
				url += "&X-Plex-Token=" + server.accessToken;	
			}
			else {
				url += "?X-Plex-Token=" + server.accessToken;
			}
		}
		return url;
	},
	getStudioFlag: function(studio,mediaTag) {
		//"/system/bundle/media/flags/studio/"+Video[index].getAttribute('studio')+"\?t="+movieMediaTagVersion;
		var url = "/system/bundle/media/flags/studio/" + encodeURIComponent(studio) + "/?t=1323560689";// + mediaTag;

		return url;
	},
	getContentRatingFlag: function(rating,mediaTag) {
		var url = "/system/bundle/media/flags/contentRating/" + encodeURIComponent(rating) + "/?t=1323560689";// + mediaTag;
		return url;
	},
	getImageTranscodeUrl: function(server,width, height, url) {
		var transcodeUrl = server.baseUrl + "/photo/:/transcode?width=" + width + "&height=" + height + "&format=jpeg&url=" + encodeURIComponent("http://127.0.0.1:32400" + url);
		if (server.accessToken) {
			transcodeUrl += "&X-Plex-Token=" + server.accessToken;
		}
		return transcodeUrl;
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
	processMyPlexServers: function(data) {
		console.log("myplex servers: " + data.MediaContainer.size);
		var addedNewServers = false;

		for (var i=0;i<data.MediaContainer.Directory.length;i++){
			var server = data.MediaContainer.Directory[i];
			var existingServer = this.getServerWithMachineId(server.machineIdentifier);

			if (!this.isInLocalServers(server.machineIdentifier) && !existingServer) {
				this.log("creating myplex server: " + server.serverName + " address: " + server.address);
	    	var foundServer = new PlexServer(server.machineIdentifier,
	    				server.serverName,
    		  		server.address, 
    		  		server.port,
    		  		undefined,
    		  		undefined,
    		  		true,
    		  		"1",
    		  		server.accessToken,
    		  		"0");
				this.myplexServers.push(foundServer);
				addedNewServers = true;
			}
		}
		if (addedNewServers) {
			this.savePrefs();
			this.log("added myplex server: " + server.name);
			//refresh shit
			this.loadPrefsFromCookie();
			this.serversRefreshedCallback.call();			
		}
	},
	myPlexSections: function() {
		if (this.myplexUser === undefined){
			this.myplexRefreshedCallback.call(undefined);
			return;
		}
		var authToken = this.myplexUser["authentication-token"];
  	var url = "https://my.plexapp.com/pms/system/library/sections?X-Plex-Token=" + authToken;
		var xml = new JKL.ParseXML(url);
	 	xml.async(enyo.bind(this,"processMyPlexSections"));
	 	xml.parse();
	},
	processMyPlexSections: function(data) {
		this.log();
		this.myplexSections = [];
		if (data.MediaContainer.Directory.length > 0) {
			this.processMyPlexServers(data); //section list contains servers as well...
			for (var i = 0; i < data.MediaContainer.Directory.length; i++) {
				var item = data.MediaContainer.Directory[i];
				if (!this.isInLocalSections(item)) {
					this.myplexSections.push(item);
					this.log("added myplex section: " + item);
				} 
			};
		}
		this.myplexRefreshedCallback(this.myplexSections);
	},
	isInLocalSections: function(item) {
		for (var i = this.localSections.length - 1; i >= 0; i--) {
			var localSec = this.localSections[i];
			if (item.machineIdentifier === localSec.machineIdentifier) {
				return true;
			}
		};
		return false;
	},
	arrangeMyPlexServersAndSections: function(pmc) {
		this.listedServers = [];
	    if (pmc !== undefined) {
	      for (var i = 0; i < pmc.size; i++) {
	        var serverAndSection = pmc.Directory[i];
	        var newServer = { serverName: serverAndSection.serverName,
	                          machineIdentifier: serverAndSection.machineIdentifier,
	                          sections: [serverAndSection]};
	        
	        this.addOrInsertNewServer(newServer);
	      }
	    }
	    return this.listedServers;
  },
  addOrInsertNewServer: function(newServer) {
    if (this.listedServers.length == 0) {
      this.listedServers.push(newServer);
      return;
    }
    for (var i = 0; i < this.listedServers.length; i++) {
      if (this.listedServers[i].machineIdentifier == newServer.machineIdentifier) {
        //for (var j = 0; j < newServer.sections.length; j++) {
          this.listedServers[i].sections.push(newServer.sections[0]);
          return;
        //};
        
      }
    };
    this.listedServers.push(newServer);
    return;
  },
});
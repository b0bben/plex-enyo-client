/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
    name: "Main.SPPGPSApp",
    kind: "VFlexBox",
    components:[
        { kind: "PageHeader", content: "SPP GPS App", flex: 0 },
		{ name: "outputData", flex: 0, style: "border: 2px solid #000; height: 200px;", allowHtml: true },
	    { kind: "BasicScroller", flex: 1, components:[
	    	{ name: "resultText", allowHtml: true }
	    ]},
		{ kind: "PalmService", name: "sppSubscription", subscribe: true},
		{ kind: "PalmService", name: "sppService"}
    ],
    create: function() {
		this.inherited(arguments);
		
		// Index of our on-screen logs
		this.i = 0;
		
		// SPP connection instanceId
		this.instanceId = 0;
		
		// logInfo method will print logs to device screen
		this.logInfo("Starting Service");
    	
		// Retrieve list of trusted bluetooth devices
    	this.$.sppService.call({},{
    		service: "palm://com.palm.bluetooth/gap/",
			method: "gettrusteddevices",
			onResponse: "getDevicesResponse"
    	});
	},
	closeFailure: function() {
    	this.log("closeFailure");
    },
    closeSuccess: function() {
    	this.log("closeSuccess");
    },
    disconnectSPP: function() {
    	/* disconnectSPP() - Disconnect SPP Device
			 * !!!!Very Important!!!!
			 * Disconnect from the SPP device when exiting the application!
		*/
    	
    	// Clear the interval that requests our GPS data
    	enyo.job.stop("readPort");
		
    	// Close our SPP connection
		this.$.sppService.call({
			"instanceId": this.instanceId
		},
		{
			service: "palm://com.palm.service.bluetooth.spp/",
			method: "close",
			onSuccess: "closeSuccess",
			onFailure: "closeFailure"
		});
		
		// Disconnect our SPP instance
		this.$.sppService.call(
			{
				"address": this.targetAddress,
				"instanceId": this.instanceId
			},
			{
				service: "palm://com.palm.bluetooth/spp/",
				method: "disconnect",
				onResponse: "sppDisconnectResponse",
				onSuccess: "sppDisconnectSuccess",
				onFailure: "sppDisconnectFailure"
			}
		 );
    },
	getDevicesResponse: function(inSender, inResponse) {
		
    	// If we found trusted device(s)...
	    if(inResponse.returnValue) {
	    	this.logInfo("gettrusteddevices: " + inResponse.returnValue);
	    	this.trustedDevicesFound(inResponse);
    	} else {
    		this.trustedDevicesNotFound(inResponse);
    	}
		
	},
	openReadReady: function(inSender, inReponse) {
		this.logInfo( "openSuccess: " + enyo.json.stringify(inReponse) );
		
		// Set interval (2500 ms) to call readPort
		enyo.job("readPort", enyo.bind(this, "readPort"), 2500);
	},
	openReadFail: function(inSender, inReponse) {
		this.logInfo( "openReadFail" );
	},
	readPort: function(inSender, inReponse) {
		this.logInfo("SPP Read Port:");
		
		// Read port
		this.$.sppService.call({
			"instanceId": this.instanceId,
			"dataLength": 1024
		},
		{
			service: "palm://com.palm.service.bluetooth.spp/",
			method: "read",
			onSuccess: "readPortSuccess",
			onFailure: "readPortFailure"
		});
	},
	readPortSuccess: function(inSender, inReponse) {
		this.logInfo("Read Success: " + inReponse.returnValue + "<br /> Data Length: " + inReponse.dataLength);
		
		/* Get the NMEA text output and parse - see NMEA specs online for more deatails*/
	    if (inReponse.returnValue===true) {
	        if (typeof inReponse.data !== "undefined") {
				
	            var gpsData = inReponse.data;
	            var i = 0;
	            var t1 = gpsData.indexOf("$GPGSA");
	            var t2 = gpsData.indexOf("\n", t1);
	            var gpgsaData = gpsData.slice(t1, t2).split(",");
	            
	            t1 = gpsData.indexOf("$GPGGA");
	            t2 = gpsData.indexOf("\n", t1);
	            var gpggaData = gpsData.slice(t1, t2).split(",");
	            
	            t1 = gpsData.indexOf("$GPRMC");
	            t2 = gpsData.indexOf("\n", t1);
	            var gprmcData = gpsData.slice(t1, t2).split(",");
	            
	            
	            var gpsMode = "";
	            switch (gpgsaData[2]) {
	                case "1":
	                    gpsMode = "No Signal.";
	                    break;
	                case "2":
	                    gpsMode = "2D";
	                    break;
	                case "3":
	                    gpsMode = "3D";
	                    break;
	                default:
	                    gpsMode = "Unk.";
	                    break;
	            }
	        	
	    		if (typeof gpgsaData[0] !== "undefined") {
	    			
	                // Get SV numbers
	                var gpsSatNumbers = "";
	                
	                // Flag to print results
	                var printResults = true;
	                
	                for (i = 3; i < 15; i++) {
	                    gpsSatNumbers += gpgsaData[i] + " ";
	                    if (gpgsaData[i] === undefined) {
	                    	printResults = false;
	                    }
	                }
	                //format and output to screen
	                var latMin = Math.round(((gpggaData[2].slice(2,gpggaData[2].length-1))/60)*10000);
					var tmpLat = gpggaData[2].slice(0,2) + "." + latMin  + gpggaData[3];
	
					var longMin = Math.round(((gpggaData[4].slice(3,gpggaData[4].length-1))/60)*10000);
					var tmpLong = gpggaData[4].slice(0,3) + "." + longMin  + gpggaData[5];
					
					if (printResults) {
	                	this.$.outputData.setContent("Mode: " + gpsMode + "<br/>Sat.List(SV\'s): " + gpsSatNumbers + "<br/>lat: " + tmpLat + "<br/>long: " + tmpLong + "<br/>Alt: " + gpggaData[9] + "Meters<br/>Speed: " + gprmcData[7] + "MPH");
                	}
	                
	            } else {
	                this.$.outputData.setContent("Invalid GPS data.  Perhaps connection is lost?");
	            }
	        } else {
	            this.logInfo("Error: GPS data undefined.")
	        }        
	    } else {
	        this.$.outputData.addContent("<br/> Unable to read from SPP Port. Unknown error.");
	    }
		
	    this.openReadReady(this, {"returnValue": true});
	},
	readPortFailure: function(inSender, inReponse) {
		this.logInfo( "readPortFailure" );
	},
	selectServiceResponse: function(inSender, inResponse) {
		this.logInfo("selectServiceResponse - " + enyo.json.stringify(inResponse) );
	},
	sppNotify: function(inSender, inResponse) {
		this.logInfo("sppNotify: " + enyo.json.stringify(inResponse) );
		
		// SPP connection instanceId
		this.instanceId = inResponse.instanceId;
		
		for(var key in inResponse) {
	        if (key === "notification") {
	            switch(inResponse.notification){
	                case "notifnservicenames":
	                    this.logInfo("SPP service name: " + inResponse.services[0]);
	                    
	                    // Send select service response - When successful, this is when device flashes "connected to palm gps" message
	                    this.$.sppService.call(
							{
								"instanceId": this.instanceId,
								"servicename": inResponse.services[0]
							},
							{
								service: "palm://com.palm.bluetooth/spp/",
								method: "selectservice",
								onResponse: "selectServiceResponse"
							}
						 );
	                    
	                    return;                                                           
	                    break;
	
	                case "notifnconnected":
	                    this.logInfo("SPP Connected");
	                    
	                    if(inResponse.error === 0){
	                    	
	                    	this.$.sppService.call({
								"instanceId": this.instanceId
							},
							{
								service: "palm://com.palm.service.bluetooth.spp/",
								method: "open",
								onSuccess: "openReadReady",
								onFailure: "openReadFail"
							});
	                    	
	                    }
	                    return;
	                    
	                    break;
	
	                case "notifndisconnected":
	                    this.logInfo("Device has terminated the connection or is out of range...");                    
	                    break;
	
	                default:
	                    break;
	            }
	        } 
	    }
		
	},
	trustedDevicesFound: function(objData) {
		
		// Address of our bluetooth device
		this.targetAddress = "";
		
		// Are there any trusted devices containing 'GPS' || 'gps' with name - Change this based on your device id
	    var targetDevice = /GPS/i;
	    
	    if(objData.trusteddevices) {
            for (i = 0; i < objData.trusteddevices.length; i++) {
            	
            	//assumes "GPS" is within the name of the bluetooth device
                if(objData.trusteddevices[i].name.search(targetDevice) > -1) {
                    this.logInfo("found: " + objData.trusteddevices[i].address);
                    this.targetAddress = objData.trusteddevices[i].address;
                }
            }
            
            // Call & subscribe to spp service
            this.$.sppSubscription.call({},{
            	service: "palm://com.palm.bluetooth/spp/",
				method: "subscribenotifications",
				onResponse: "sppNotify"
            });
            
            // If bluetooth target address exists
            if(this.targetAddress !== "") {
            	
            	// Connect to our bluetooth device
            	this.$.sppService.call( {
            		"address": this.targetAddress
        		}, {
        			service: "palm://com.palm.bluetooth/spp/",
            		method: "connect"
            	} );
        	}
            
            
        }
		
	},
	trustedDevicesNotFound: function(objData) {
		this.logInfo("No Trusted Bluetooth Devices Found: " + enyo.json.stringify(objData) );
	},
	logInfo: function(content) {
		/* logInfo(content) - Log & display data on the screen
			 * Logs content and displays it in reverse-chronological order
		*/
		
		var new_content = "<strong>" + this.i + "</strong>: " + content + this.$.resultText.generateHtml() + "<br />";
		this.$.resultText.setContent(new_content);
		
		this.i++;
	},
	sppDisconnectResponse: function() {
    	this.log("sppDisconnectResponse");
    },
	sppDisconnectSuccess: function() {
    	this.log("sppDisconnectSuccess");
    },
	sppDisconnectFailure: function() {
    	this.log("sppDisconnectFailure");
    },
    unloadHandler: function() {
    	/* unloadHandler() - Disconnect SPP Device
			 * Called when application is dismissed/closed
		*/
		//make sure to disconnect from the SPP SERVICE!
		this.disconnectSPP();
	}
});

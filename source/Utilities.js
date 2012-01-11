Utilities = {
  
  formatTime: function(floatSeconds)
  {

    if (floatSeconds >= 0) 
    {
      var intMinutes = Math.floor(floatSeconds / 60);
      var intSeconds = Math.floor(floatSeconds % 60);
      var strSeconds = intSeconds + '';
      
      if (strSeconds.length < 2) 
      {
        strSeconds = "0" + strSeconds;
      }
      
      var intHours = Math.floor(intMinutes / 60);
      intMinutes = Math.floor(intMinutes % 60);
      
      var strMinutes = intMinutes + '';

      
      var strTime;
      
      if(intHours > 0)
      {
        if (strMinutes.length < 2) 
        {
          strMinutes = "0" + strMinutes;
        }
        return intHours + ":" + strMinutes + ":" + strSeconds;
      }
      else
      {
        return strMinutes + ":" + strSeconds;
      }
      
    }
    else 
    {
      return "0:00";
    }
  },
  
  
  isNumeric: function(objValue)
  {
    return typeof objValue === 'number' && isFinite(objValue);
  },
  
  S4: function()
  {
      return (((1+Math.random())*100000000)|0).toString(16).substring(1);
  },

  generateGuid: function()
  {
        return (this.S4()+this.S4()+"-"+this.S4()+"-"+this.S4()+"-"+this.S4()+"-"+this.S4()+this.S4()+this.S4()).toUpperCase();
  },
  
  
  
  getTrackImage: function (strImageFile, intImageSize)
  {
    
    //Album art isn't working on the browser
    if(intImageSize === undefined)
    {
      intImageSize = 90;
    }
      
      return "/var/luna/data/extractfs" + encodeURIComponent(strImageFile) + ":" + intImageSize + ":" + intImageSize + ":3";
    
  },
  
  fastTrim: function (strRaw)
  {
    if(strRaw)
    {
      return strRaw.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    }
    
    return strRaw;
  }
  
};
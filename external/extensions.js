Number.prototype.leftZeroPad = function(numZeros) {
        var n = Math.abs(this);
        var zeros = Math.max(0, numZeros - Math.floor(n).toString().length );
        var zeroString = Math.pow(10,zeros).toString().substr(1);
        if( this < 0 ) {
                zeroString = '-' + zeroString;
        }

        return zeroString+n;
};

String.prototype.startsWith = function(str) 
{return (this.match("^"+str)==str)};

String.prototype.trim = function(){return 
(this.replace(/^[\s\xA0]+/, "").replace(/[\s\xA0]+$/, ""))};

String.prototype.endsWith = function(str) 
{return (this.match(str+"$")==str)};
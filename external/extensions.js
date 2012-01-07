Number.prototype.leftZeroPad = function(numZeros) {
        var n = Math.abs(this);
        var zeros = Math.max(0, numZeros - Math.floor(n).toString().length );
        var zeroString = Math.pow(10,zeros).toString().substr(1);
        if( this < 0 ) {
                zeroString = '-' + zeroString;
        }

        return zeroString+n;
};
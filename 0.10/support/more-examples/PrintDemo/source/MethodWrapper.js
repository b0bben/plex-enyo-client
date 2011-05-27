/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
var wrapMethod = function(target, methodName, decorator) {
	var count = 0;
	var totalTime = 0;
	var orig = target[methodName];
	var func = function() {
		var displayName = this.kindName + '.' + methodName + '()';
		var startTime = Date.now();
		var result = orig.apply(this, arguments);
		var elapsed = Date.now() - startTime;
		count++;
		totalTime += elapsed - 0.5;  // try to account for rounding error

		// If any time elapsed, log something.
		if (elapsed) { 
			// Decorator should return a string or null
			var decoratorText = decorator && decorator.apply(this, [result].concat(arguments));
			if (!decoratorText) decoratorText = '';

			console.log ('FINISHED ' + displayName + ' in ' + elapsed + 'ms   (total: ' + totalTime + 'ms)   ' + decoratorText); 
		}

		return result;
	}
	func.getCount = function() { return count; }
	func.getTotalTime = function() { return totalTime; }
	target[methodName] = func;
	return func;
}
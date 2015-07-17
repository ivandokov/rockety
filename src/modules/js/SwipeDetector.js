/*global jQuery:false*/

/*
*
* Swipe Detector
*
*
	*
	*	JS:
	*

		var swipe = new SwipeDetector('.slider', {
			thresholdX: 20,
			thresholdY: 20,
			swipeLeft: function() {},
			swipeRight: function() {},
			swipeUp: function() {},
			swipeDown: function() {},
			preventDefaultEvents: true
		});
*
*/

var SwipeDetector = (function($) {
'use strict';

function SwipeDetector( selector, options ) {

	if ( typeof selector === 'undefined' || ! $(selector).length )
		return;

	var defaults = {
		thresholdX: 20,
		thresholdY: 20,
		swipeLeft: function() {},
		swipeRight: function() {},
		swipeUp: function() {},
		swipeDown: function() {},
		preventDefaultEvents: true
	};

	options = $.extend(defaults, options);
	var
	element = $(selector)[0],
	startX,
	startY,
	isMoving = false;

	function cancelTouch() {
		element.removeEventListener('touchmove', onTouchMove);
		startX = null;
		isMoving = false;
	}

	function onTouchMove(e) {

		if ( options.preventDefaultEvents )
			e.preventDefault();

		if( ! isMoving )
			return;

		var x = e.touches[0].pageX;
		var y = e.touches[0].pageY;
		var dx = startX - x;
		var dy = startY - y;
		var absDx = Math.abs(dx);
		var absDy = Math.abs(dy);

		if ( absDx >= options.thresholdX ) {
			cancelTouch();
			if ( dx > 0) options.swipeLeft(); else options.swipeRight();
		}
		else if ( absDy >= options.thresholdY ) {
			cancelTouch();
			if ( dy > 0 ) options.swipeDown(); else options.swipeUp();
		}
	}

	function onTouchStart(e) {

		if (e.touches.length !== 1)
			return;

		startX = e.touches[0].pageX;
		startY = e.touches[0].pageY;
		isMoving = true;
		element.addEventListener('touchmove', onTouchMove, false);
	}

	if ('ontouchstart' in document.documentElement) {
		element.addEventListener('touchstart', onTouchStart, false);
	}
}

return SwipeDetector;
})(jQuery);
/*global jQuery:false*/

/*
*
* HashNavigator
*
*
	*
	*	JS:
	*

	var hash = new HashNavigator({
		scrollSpeed: 2000,
		onBeforeScroll: function(e) {
			console.log(e);
		},
		onScrollComplete: function(e) {
			console.log(e);
		}
	});
	hash.autoScrollToHash();
*
*/

var HashNavigator = (function($) {
'use strict';

function HashNavigator( options ) {

	this.hash = '';
	this.links = [];

	var settings = {
		scrollSpeed: 800,
		onBeforeScroll: function() {},
		onScrollComplete: function() {}
	};

	options = typeof options === 'undefined' ? {} : options;

	this.options = $.extend(settings, options);
}

HashNavigator.prototype.getHash = function() {

	return ( this.hash = document.location.hash.replace('#!','') );
};

HashNavigator.prototype.getLinksForHash = function() {

	return ( this.links = $('body').find('a[href^="#!' + this.hash + '"]') );
};

HashNavigator.prototype.getTargetTop = function( hash ) {

	hash = hash ? hash : this.getHash();
	var el = $('[id='+ hash +'], [name='+ hash +']').filter(':first');

	return ( ! el.length ) ? 0 : el.offset().top;
};

HashNavigator.prototype.scrollToHash = function( hash ) {

	var _this = this;
	hash = hash ? hash : this.getHash();

	_this.options.onBeforeScroll(_this);

	$('html,body').stop(true).animate({

		scrollTop : _this.getTargetTop( hash )

	}, _this.options.scrollSpeed, function() {

		_this.options.onScrollComplete(_this);

	});
};

HashNavigator.prototype.autoScrollToHash = function() {

	var _this = this;

	$(document).on('click', function(e) {
		setTimeout(function() {
			if ( $(e.target).is('a[href$="#!'+ _this.getHash() +'"]') )
				_this.scrollToHash();
		},25);
	});

	$(window).load(function() {
		if ( _this.getHash().length )
			_this.scrollToHash();
	});
};

return HashNavigator;
})(jQuery);
/*global jQuery:false*/

/*
	Plugin: jQuery Parallax
	Version 1.1.3
	Author: Ian Lunn
	Twitter: @IanLunn
	Author URL: http://www.ianlunn.co.uk/
	Plugin URL: http://www.ianlunn.co.uk/plugins/jquery-parallax/

	Dual licensed under the MIT and GPL licenses:
	http://www.opensource.org/licenses/mit-license.php
	http://www.gnu.org/licenses/gpl.html

	How to use it:

		$('.parallax .background').parallax('50%', 0.3);
*/

(function($){
	'use strict';

	var $window = $(window);
	var windowHeight = $window.height();

	$window.resize(function () {
		windowHeight = $window.height();
	});

	$.fn.parallax = function(xpos, speedFactor, outerHeight) {
		var $this = $(this);
		var getHeight;
		var firstTop;

		$this.each(function() {
			firstTop = $this.offset().top;
		});

		if (outerHeight) {
			getHeight = function(jqo) {
				return jqo.outerHeight(true);
			};
		} else {
			getHeight = function(jqo) {
				return jqo.height();
			};
		}

		if (arguments.length < 1 || xpos === null) xpos = '50%';
		if (arguments.length < 2 || speedFactor === null) speedFactor = 0.1;
		if (arguments.length < 3 || outerHeight === null) outerHeight = true;

		function update(){
			var scrollTop = $window.scrollTop();

			$this.each(function() {
				var $el = $(this);
				var elTop = $el.offset().top;
				var elHeight = getHeight($el);

				if (scrollTop > (elTop + elHeight) || (scrollTop + windowHeight) < elTop) {
					$el.css('backgroundPosition', xpos + ' 0');
				}
				else {
					var top = scrollTop - elTop;
					var calcTop = Math.round(top * speedFactor);
					$el.css('backgroundPosition', xpos + ' ' + calcTop + 'px');
				}
			});
		}

		$window.bind('scroll', update).resize(update);
		update();
	};
})(jQuery);
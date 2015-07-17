/*global jQuery:false*/

/*
*
* Popup
*
*
	*
	*	CSS:
	*

		.popup_bg {
			position: fixed;
			z-index: 10;
			width: 100%;
			height: 100%;
			background: #000;
			.opacity (0);
			.transition(0.3s, ease-in-out);

			&.animate {
				.opacity (0.3);
			}
		}
		.popup {
			position: fixed;
			top: 0;
			left: 50%;
			z-index: 2000;
			width: 796px;
			min-height: 500px;
			margin-left: -398px;
			padding: 30px 50px;
			background: #fff;
			.radius (10px);
			.opacity (0);
			.transition(0.5s, ease-in-out);

			&.animate {
				.opacity (1);
			}
		}

	*
	*	JS:
	*

		var pp = new Popup({
			popupBgClass: 'popup_bg',
			popupClass: 'popup',
			hasClose: true,
			showSpeed: 200,
			hideSpeed: 200,
			removeAfter: 800,
			onBeforeShow: function() {},
			onShow: function() {},
			onBeforeHide: function() {},
			onHide: function() {}
		});
		pp.show('test');
*
*/

var Popup = (function($) {
'use strict';

function Popup( options ) {

	var settings = {
		popupBgClass: 'popup_bg',
		popupClass: 'popup',
		hasClose: true,
		showSpeed: 200,
		hideSpeed: 200,
		removeAfter: 800,
		onBeforeShow: function() {},
		onShow: function() {},
		onBeforeHide: function() {},
		onHide: function() {}
	};

	options = typeof options === 'undefined' ? {} : options;

	this.options	= $.extend(settings, options);
	this.bothEls	= '.'+ this.options.popupBgClass +', .'+ this.options.popupClass;
	this.window		= { w: $(window).width(), h: $(window).height() };
	this.popupSize	= { w:0, h:0 };

	this.registerClose();
}

Popup.prototype.registerClose = function() {

	var _this = this;

	$(document).on('click', _this.bothEls+' .close', function() {

		_this.options.onBeforeHide(_this);

		var popup = $('body').find(_this.bothEls);
		popup.each(function(){
			$(this).removeClass('animate');
		});

		setTimeout(function() {
			popup.remove();
			_this.options.onHide(_this);
		}, _this.options.removeAfter);

	});
};

Popup.prototype.showOnScreen = function() {

	$('body').find(this.bothEls).each(function(){
		$(this).addClass('animate');
	});
};

Popup.prototype.calculatePopupTop = function() {

	var pH = this.popupSize.h;
	var wH = this.window.h;

	var top = ((wH - pH) / 2 - 30); // no idea why -30 but it centers better

	return top;
};

Popup.prototype.show = function( content ) {

	var _this = this;

	var html = '';
	html += '<div class="'+ this.options.popupBgClass +'"></div>';
	html += '<div class="'+ this.options.popupClass +'">';
	if ( this.options.hasClose )
		html +=	'<span class="close">&times;</span>';
	html +=		content;
	html += '</div>';

	var popup = $(html);

	$('body').prepend(popup);

	var popupDOM = $('body').find('.popup');
	this.popupSize = {
		w: popupDOM.width(),
		h: popupDOM.height()
	};

	var popupTop = _this.calculatePopupTop();
	var popupCss = popupTop > 0 ? {
		top: popupTop
	} : {
		position: 'absolute'
	};

	_this.options.onBeforeShow(_this);
	setTimeout(function() {
		popupDOM.css(popupCss);
		_this.showOnScreen();
		_this.options.onShow(_this);
	},100);
};

Popup.prototype.hide = function() {

	$('.'+ this.options.popupBgClass).click();
};

Popup.prototype.close = function() {
	
	this.hide();
};

return Popup;
})(jQuery);
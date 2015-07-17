/*global jQuery:false*/

/*
*
* Tabber
*
*
	*
	*	HTML:
	*

		<div class="tabs">
			<nav>
				<a href="#!link1">Link 1</a>
				<a href="#!link2">Link 2</a>
				<a href="#!link3">Link 3</a>
			</nav>
			<div>
				<article>Tab 1<br>Tab 1<br>Tab 1</article>
				<article>Tab 2<br>Tab 2</article>
				<article>Tab 3<br>Tab 3<br>Tab 3<br>Tab 3</article>
			</div>
		</div>

	*
	*	JS:
	*

		var tb = new Tabber('.tabs', {
			changeTime: 300,
			showTime: 500,
			hashNavigation: true,
			onBeforeChange: function() {},
			onChange: function() {}
		});
*
*/

var Tabber = (function($) {
'use strict';

function Tabber( selector, options ) {

	if ( typeof selector === 'undefined' || ! $(selector).length )
		return;

	var defaults = {
		changeTime: 300,
		showTime: 500,
		hashNavigation: true,
		onBeforeChange: function() {},
		onChange: function() {}
	};

	this.options		= $.extend(defaults, options);
	this.selector		= selector;
	this.tabber			= $(selector);
	this.tabIndex		= 0;
	this.menu			= $(this.selector).children('nav').first();
	this.tabs			= $(this.selector).children(':not(nav)').first();

	this.showTab(0, 0);
	this.menuEvents();
	this.getCurrentTab();
	this.showTabOnLoad();
}

Tabber.prototype.getCurrentTab = function() {

	this.tabIndex = this.menu.children().index(this.menu.children('.active'));
	this.tabIndex = this.tabIndex > -1 ? this.tabIndex : 0;

	return this.tabIndex;
};

Tabber.prototype.getSavedTab = function() {

	var link,
	hash = document.location.hash;

	if ( ! this.options.hashNavigation )
		return;

	if ( ! hash )
		return;

	hash = hash.replace('#!','');
	link = this.menu.children('.'+hash);
	link = link.length ? link : this.menu.children('[href^="#!'+hash+'"]');

	return link.length ? link : null;
};

Tabber.prototype.showTabOnLoad = function() {

	var tab = this.getSavedTab();
	if ( tab ) tab.click(); else this.showTab(this.tabIndex, 0);
};

Tabber.prototype.showTab = function( index, changeTime ) {

	var _this = this,
	clicked = _this.menu.children().eq(index),
	tab = _this.tabs.children().eq(index);
	changeTime = isNaN(parseInt(changeTime)) ? _this.options.changeTime : parseInt(changeTime);

	_this.options.onBeforeChange(_this, clicked, index);

	clicked.addClass('active').siblings().removeClass('active');

	_this.tabs.stop(true,true).animate({
		height: tab.outerHeight()
	}, changeTime);

	tab.siblings(':visible').hide();

	tab.fadeIn(_this.options.showTime, function() {
		_this.tabs.css({ height: 'auto' });
	});

	_this.options.onChange(_this, clicked, index);
};

Tabber.prototype.menuEvents = function() {

	var _this = this,
	links = this.menu.children();

	links.on('click', function() {

		_this.showTab( links.index($(this)) );

		if ( ! _this.options.hashNavigation )
			return false;

	});
};

return Tabber;
})(jQuery);
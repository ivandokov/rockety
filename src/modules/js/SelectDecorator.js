/*global jQuery:false, Browser:false, console:false*/

/*
*
* Select Decorator
*
*
	*
	*	JS:
	*

		var slc = new SelectDecorator('.selectDecorator');
*
*/

var SelectDecorator = (function($) {
'use strict';

function SelectDecorator( selector ) {

	var _this = this;

	_this.s = {
		wrapper : 'sd-wrapper',
		select	: 'sd-select',
		label	: 'sd-label',
		options : 'sd-options'
	};

	_this.sc = {
		wrapper : '.'+_this.s.wrapper,
		select	: '.'+_this.s.select,
		label	: '.'+_this.s.label,
		options : '.'+_this.s.options
	};

	_this.isMobile = Browser.isMobile();

	$(selector).each(function() {
		_this.parseElements($(this));
	});

	_this.registerEvents();
}

SelectDecorator.prototype.close = function( wrapper ) {

	var _this = this;

	wrapper = typeof wrapper === 'undefined' ? $(_this.sc.wrapper) : wrapper;
	wrapper.each(function() {
		$(this).find(_this.sc.options).hide();
		$(this).removeClass('open');
	});
};

SelectDecorator.prototype.open = function( wrapper ) {

	var _this = this;

	wrapper = typeof wrapper === 'undefined' ? $(_this.sc.wrapper) : wrapper;
	wrapper.each(function() {
		$(this).find(_this.sc.options).show();
		$(this).addClass('open');
	});
};

SelectDecorator.prototype.reload = function( wrapper ) {

	var _this = this;

	wrapper = typeof wrapper === 'undefined' ? $(_this.sc.wrapper) : wrapper;
	wrapper.each(function() {
		var html = [],
		opts = $(this).find('select option'),
		selected = opts.filter(':selected'),
		select = $(this).find(_this.sc.options),
		label = $(this).find(_this.sc.label);

		selected = selected.length ? selected : opts.filter(':first');
		opts.each(function() { html.push( '<li style="display:block">'+ $(this).text() +'</li>' ); });
		label.html(selected.text());
		select.html(html.join(''));
	});
};

SelectDecorator.prototype.parseElements = function( el ) {

	var wrapper = null,
	select = null,
	label = null,
	options = null,
	height = el.outerHeight()+'px',
	opts = el.find('option'),
	selected = opts.filter(':selected'),
	html = ['<span class="'+ this.s.label +'"></span>', '<ul class="'+ this.s.options +'">'],
	css = {
		position		: 'relative',
		display			: 'inline-block',
		verticalAlign	: 'middle',
		width			: el.outerWidth(),
		height			: el.outerHeight(),
		marginTop		: this.o(el.css('marginTop')),
		marginRight		: this.o(el.css('marginRight')),
		marginBottom	: this.o(el.css('marginBottom')),
		marginLeft		: this.o(el.css('marginLeft'))
	},
	cssBlock = {
		position :'relative',
		display :'block',
		width	:'100%',
		height	:'100%'
	},
	sdWrapper = $('<div></div>').addClass('sd ' + this.s.wrapper).css(css),
	sd = $('<div></div>').addClass(this.s.select).css(cssBlock);

	el.css({position:'absolute', top:0, margin:0});
	el.css( ( this.isMobile ? {opacity:0,zIndex:2} : {display:'none'} ) );
	el.wrap(sdWrapper);

	sd.insertAfter(el);

	wrapper = el.parent();
	select = wrapper.find(this.sc.select);

	selected = selected.length ? selected : opts.filter(':first');
	opts.each(function() { html.push( '<li style="display:block">'+ $(this).text() +'</li>' ); });
	html.push('</ul>');

	select.html(html.join(''));

	label = select.find(this.sc.label);
	label.css(cssBlock).css({lineHeight:'1.1'}).html(selected.text());

	options = select.find('ul');
	options.hide();
	options.css({position:'absolute', top:height, width:'100%'});

	el.data('sd', this);
};

SelectDecorator.prototype.registerEvents = function() {

	var _this = this;

	if ( _this.isMobile ) {
		/*
		*	Select options
		*/
		$(document).off('change.sdSelectOptionsMobile');
		$(document).on('change.sdSelectOptionsMobile', _this.sc.wrapper+' > select', function() {
			var select = $(this);
			var options = select.find('option');
			var selected = options.filter(':selected');
			var label = select.next().find(_this.sc.label);

			label.html(selected.text());
		});
	}
	else {
		/*
		*	Toggle options
		*/
		$(document).off('click.sdToggleOptions');
		$(document).on('click.sdToggleOptions', _this.sc.label, function() {
			var el = $(this);
			var options = el.siblings('ul');
			var wrapper = options.closest(_this.sc.wrapper);

			if ( options.is(':visible') ) {
				_this.close(wrapper);
			}
			else {
				_this.open(wrapper);
			}
		});

		/*
		*	Select options
		*/
		$(document).off('click.sdSelectOptions');
		$(document).on('click.sdSelectOptions', _this.sc.options+' > li', function() {
			var el = $(this);
			var label = el.parent().prev();
			var options = el.parent().children();
			var index = options.index(el);
			var wrapper = label.closest(_this.sc.wrapper);
			var select = wrapper.find('select');

			label.html(el.text());

			select.find('option:selected').prop('selected',false);
			select.find('option').eq(index).prop('selected',true);
			select.trigger('change');
			_this.close(wrapper);
		});

		/*
		*	Close options on click outside
		*/
		$(document).off('click.sdCLoseOptions');
		$(document).on('click.sdCLoseOptions', null, function(e) {

			if ( ! $(_this.sc.wrapper).length )
				return;

			var el = $(e.target).closest(_this.sc.wrapper);
			var sds = $(_this.sc.wrapper);

			if ( el.length ) {
				el.attr('data-sd-target', 1);
				sds = sds.filter(':not([data-sd-target])');
			}

			sds.each(function() {
				var wrapper = $(this).closest(_this.sc.wrapper);
				_this.close(wrapper);
			});

			el.removeAttr('data-sd-target');

		});
	}
};

SelectDecorator.prototype.o = function( val ) {

	return isNaN(parseInt(val)) ? 0 : parseInt(val);
};

return SelectDecorator;

})(jQuery);
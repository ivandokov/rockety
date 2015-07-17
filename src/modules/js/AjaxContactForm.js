/*global jQuery:false, console:false*/

/*
*
* AjaxContactForm
*
*
	*
	*	HTML:
	*

		<div class="cf-message cf-success">Your message was sent successfully!</div>
		<div class="cf-message cf-error">Please fill all fields and use a valid email!</div>
		<form method="post" class="contact-form">
			<input type="text" name="name" placeholder="Name">
			<input type="text" name="email" placeholder="Email">
			<textarea name="message" placeholder="Message"></textarea>
			<input type="submit" value="Send">
		</form>

	*
	*	JS:
	*

		var acf = new AjaxContactForm('.contact-form', {
			ajaxUrl : '/ajax/contact-form',
			errorSelector : '.cf-error',
			successSelector : '.cf-success',
			msgFadeTime : 200,
			formFadeTime : 1000,
			onSuccess : function(response) {},
			onFailure : function(response) {},
			onResponse : function(response) {}
		});

	*
	*	PHP:
	*

		// Config
		$to = 'development@dtailstudio.com';
		$subject = 'Contact form';
		$values = array(
			'name'		=> trim(@$_POST['name']),			// mandatory
			'email'		=> trim(@$_POST['email']),			// mandatory
			'website'	=> trim(@$_POST['website']),
			'message'	=> nl2br(trim(@$_POST['message'])),	// mandatory
		);
		// End of Config

		$errors = $content = array();

		foreach ( $values as $key => $value ) {
			if ( ! strlen($value) )
				$errors[] = $key . ' is empty';
		}

		if ( ! preg_match('/^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,3})$/', $values['email']) )
			$errors[] = 'email is invalid';

		if ( count($errors) ) {
			echo json_encode(array('status'=>'failure','errors'=>$errors));
			exit;
		}

		foreach ( $values as $key => $value )
			$content[] = '<strong>'.$key.'</strong>: ' . $value;

		$content[] = '<br><em><small>This email is sent from a contact form.</small></em>';

		$headers = array('MIME-Version: 1.0', 'Content-type: text/html; charset=utf-8', 'From: ' . $values['name'] . ' <' . $values['email'] . '>');

		mail($to, $subject, implode("<br>", $content), implode("\r\n", $headers) . "\r\n");

		echo json_encode(array('status'=>'success'));
		exit;
*
*/

var AjaxContactForm = (function($) {
'use strict';

function AjaxContactForm( selector, options ) {

	if ( typeof selector === 'undefined' || ! $(selector).length )
		return;

	var defaults = {
		ajaxUrl: '/ajax/contact-form',
		errorSelector: '.cf-error',
		successSelector: '.cf-success',
		msgFadeTime: 200,
		formFadeTime: 1000,
		onSuccess: function() {},
		onFailure: function() {},
		onResponse: function() {}
	},
	_this = this;

	this.options	= $.extend(defaults, options);
	this.selector	= selector;
	this.form		= $(selector);
	this.response	= {};

	this.options.ajaxUrl			= this.options.ajaxUrl			|| console.warn('Required ajaxUrl selector');
	this.options.errorSelector		= this.options.errorSelector	|| console.warn('Required errorSelector selector');
	this.options.successSelector	= this.options.successSelector	|| console.warn('Required successSelector selector');

	this.errorEl	= $(this.options.errorSelector).hide();
	this.successEl	= $(this.options.successSelector).hide();

	this.form.on('submit', function() {

		$.post(_this.options.ajaxUrl, _this.form.serialize(), function(responseJSON) {

			_this.response = _this.parseResponse(responseJSON);
			_this.options.onResponse(_this.response);

			if ( _this.response.status === 'success' ) _this.success(); else _this.failure();

		});

		return false;

	});
}

AjaxContactForm.prototype.parseResponse = function( response ) {

	var json = {};

	try {
		json = JSON.parse(response);
	} catch(e) {
		json.status = 'failure';
		json.errors = ['Cannot parse AJAX response. Check ajaxUrl or response.'];
	}
	return json;
};

AjaxContactForm.prototype.success = function() {

	this.form.find('input,textarea').not('[type=submit]').each(function() {
		$(this).val('');
	});

	this.form.find('select').each(function() {
		$(this).find('option:first').attr('selected',true);
	});

	this.form.fadeOut(this.formFadeTime);

	this.successShow();

	this.options.onSuccess(this.response);
};

AjaxContactForm.prototype.failure = function() {

	this.errorShow();

	this.options.onFailure(this.response);
};

AjaxContactForm.prototype.errorHide = function() {

	if ( this.errorEl.is(':visible') )
		this.errorEl.fadeOut(this.options.msgFadeTime);
};

AjaxContactForm.prototype.errorShow = function() {

	if ( ! this.errorEl.is(':visible') )
		this.errorEl.fadeIn(this.options.msgFadeTime);

	this.successHide();
};

AjaxContactForm.prototype.successHide = function() {

	if ( this.successEl.is(':visible') )
		this.successEl.fadeOut(this.options.msgFadeTime);
};

AjaxContactForm.prototype.successShow = function() {

	if ( ! this.successEl.is(':visible') )
		this.successEl.fadeIn(this.options.msgFadeTime);

	this.errorHide();
};

return AjaxContactForm;
})(jQuery);
var Browser = (function() {
'use strict';

var Browser = {

	isSafari: function() {

		var chrome = /chrome/i.test(navigator.userAgent);
		var safari = /safari/i.test(navigator.userAgent);
		return safari && ! chrome ? true : false;
	},

	isIE: function( version ) {
		var ua = navigator.userAgent;
		// var ua = 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; .NET CLR 1.1.4322)'; // for tests

		if ( ! /MSIE (\d+)\.\d+/.test(ua) )
			return false;

		if ( ! version )
			return true;

		return version === parseInt(RegExp.$1);
	},

	isMac: function() {
		return (navigator.appVersion.indexOf('Mac')!==-1) ? true : false;
	},

	isMobile: function() {
		return ( 'ontouchstart' in document.documentElement ? true : false );
	},

	click: function() {
		return  ( Browser.isMobile() ? 'touchstart' : 'click' );
	}
};

return Browser;
})();

/*
*
* IE Warning
*
* Show warning window for IE 6-8 for old and not supported browser
*
*/
(function() {
'use strict';
	setTimeout(function(){
		if ( Browser.isIE(6) || Browser.isIE(7) || Browser.isIE(8) || Browser.isIE(9) ) {
			var
			iePopup  = '<div style="position:fixed; z-index:2147483646; top:0; left:0; width:100%; height:100%; background:#e73d51; font-family:sans-serif; text-align:center; line-height:26px; color:#fff">';
			iePopup += '<div style="position:fixed; top:50%; left:50%; width:400px; height:200px; margin:-100px 0 0 -200px">';
			iePopup += '<h1 style="font-size:30px; font-weight:bold; margin-bottom:30px">Your browser is old!</h1>';
			iePopup += 'This version of Internet Explorer is old<br> and not supported.<br><br>';
			iePopup += 'Please download <a href="http://outdatedbrowser.com/" style="color:#fff; text-decoration:underline">a better browser</a>.';
			iePopup += '</div>';
			iePopup += '</div>';

			var div = document.createElement('div');
			div.innerHTML = iePopup;
			document.body.appendChild(div.children[0]);
		}
	},200);
})();
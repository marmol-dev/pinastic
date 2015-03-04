'use strict';

(function(chrome, $) {

	/**
	 * Constants
	 */
	var PINTEREST_URL = 'http://www.pinterest.com/pin/create/bookmarklet/?extension=true',
		SESSION_SECRET;


	/**
	 * Private methods
	 */

	function loadInIframe(url, callback) {
		if (typeof url !== 'string') {
			throw new Error('Invalid loadInIframe url');
		}

		var $iframe = $('<iframe>', {
			src: url,
		});

		if (typeof callback === 'function') {
			$iframe.on('load', function() {
				callback.call($(this), $iframe);

			});
		}

		$('body').append($iframe);

		return $iframe;
	}

	var $iframe;

	function sendAction(action, input, callback) {
		if (!SESSION_SECRET) {
			throw new Error('SESSION_SECRET has not been initializated yet');
		}

		//TODO: Two sync requests

		if (!$iframe) {
			loadInIframe(PINTEREST_URL, function($ifr) {
				$iframe = $ifr;
				sendAction.apply(this, arguments);
			});
		} else {
			var request = {
				action: action,
				data: input,
				SESSION_SECRET: SESSION_SECRET
			};

			/*chrome.runtime.sendMessage(request, function(res) {
				res = res instanceof Object ? res : {};
				callback(res.error, res.data);
			});*/



		}
	}

	/**
	 * API methods
	 */


	function getBoards(options, callback) {

		if (typeof options === 'function') {
			callback = options;
			options = null;
		}

		if (typeof callback !== 'function') {
			throw new Error('Invalid callback function');
		}

		if (options instanceof Object && options.reloadIframe === true) {
			if ($iframe) $iframe.remove();
		}

		sendAction('get-boards', null, callback);

	}

	function publishPin(pin, callback) {

		if (pin instanceof Object === false || typeof callback !== 'function') {
			throw new Error('Invalid arguments. Arguments: pin <Object>, callback <Function>');
		}

		if (typeof pin.board !== 'string' || typeof pin.mediaUrl !== 'string') {
			throw new Error('Pin required arguments: board <String>, mediaUrl <String>.');
		}

		if (typeof pin.description !== 'string') {
			pin.description = ' ';
		}

		if (typeof pin.mediaPage !== 'string') {
			pin.mediaPage = pin.mediaUrl;
		}

		sendAction('publish-pin', pin, callback);
	}

	function init(sessionSecret) {
		SESSION_SECRET = sessionSecret;
	}

	window.PinterestAPI = {
		publishPin: publishPin,
		getBoards: getBoards,
		init: init
	};

})(window.chrome, window.$);

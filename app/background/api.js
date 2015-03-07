'use strict';

(function(chrome, $, _) {

	/**
	 * Constants
	 */
	var PINTEREST_TOKEN_URL = 'http://www.pinterest.com/pin/create/bookmarklet/?extension=true',
		PINTEREST_ACTIONS_URL = 'http://www.pinterest.com/pin/create/extension/?extension=true', //'https://help.pinterest.com/sites/help/themes/custom/pinterest_help/logo.png?extension=true',
		SESSION_SECRET = _.random(0, 2e9),
		TOKEN;

	chrome.webRequest.onHeadersReceived.addListener(
		function(info) {
			_.remove(info.responseHeaders, function(header) {
				return header.name.toLowerCase() === 'x-frame-options' || header.name.toLowerCase() === 'frame-options';
			});

			return {
				responseHeaders: info.responseHeaders
			};
		}, {
			urls: ['*://*.pinterest.com/*'], // Pattern to match pinterest pages
			types: ['sub_frame']
		}, ['blocking', 'responseHeaders']
	);


	/**
	 * Private methods
	 */

	function loadInIframe(url, callback) {
		if (typeof url !== 'string') {
			throw new Error('Invalid loadInIframe url');
		}

		var $iframe = $('<iframe>', {
			src: url
		});

		if (typeof callback === 'function') {
			$iframe.on('load', function() {
				callback.call($(this), $iframe);
			});
		}

		$('body').append($iframe);

		return $iframe;
	}

	function getToken(callback){
		loadInIframe(PINTEREST_TOKEN_URL, function($iframe){
			chrome.runtime.sendMessage({action: 'get-token', data: {}, SESSION_SECRET: SESSION_SECRET}, function(res){
				res = res instanceof Object ? res : {};
				$iframe.remove();
				callback(res.error, res.data);
			});
		});
	}

	var sendAction = (function() {
		var $iframe,
			loading = false;

		return function(action, input, callback) {
			if (typeof action !== 'string' || (input !== null && input instanceof Object === false) || typeof callback !== 'function') {
				throw new Error('Invalid sendAction invocation');
			}

			if (!TOKEN) {
				throw new Error('Invalid TOKEN');
			}

			var sendArguments = arguments;

			if (!$iframe) {
				if (!loading) {
					$iframe = loadInIframe(PINTEREST_ACTIONS_URL);
				} 

				$iframe.on('load', function() {
					sendAction.apply(this, sendArguments);
				});
			} else {
				var request = {
					action: action,
					data: input,
					SESSION_SECRET: SESSION_SECRET,
					TOKEN: TOKEN,
				};

				chrome.runtime.sendMessage(request, function(res) {
					console.info('IFRAME REQUEST', request, 'IFRAME RESPONSE', res);
					res = res instanceof Object ? res : {};
					callback(res.error, res.data);
				});
			}
		};
	})();

	/*
	 * API methods
	 */


	/**
	 * Get the boards of a username
	 * @param <Object {'username' <String>}> options object
	 * @param <Function> a function executed after boards returned
	 */
	function getBoards(options, callback) {

		if (options instanceof Object === false) {
			throw new Error('Invalid getBoard options');
		}

		if (typeof options.username !== 'string') {
			throw new Error('Invalid getBoard username');
		}

		if (typeof callback !== 'function') {
			throw new Error('Invalid callback function');
		}

		//TODO: better solution
		/*if (options instanceof Object && options.reloadIframe === true) {
			if ($iframe) $iframe.remove();
		}*/

		sendAction('get-boards', options, callback);

	}

	/**
	 *
	 */
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

	/**
	 *
	 */
	function getUsername(callback) {
		sendAction('get-username', {}, callback);
	}

	function initialize(callback){
		getToken(function(err, token){
			if (!err){
				TOKEN = token;
			}
			callback(err);
		});
	}

	/**
	 * Public interface
	 */
	window.PinterestAPI = {
		publishPin: publishPin,
		getBoards: getBoards,
		getUsername: getUsername,
		init : initialize
	};

})(window.chrome, window.$, window._);

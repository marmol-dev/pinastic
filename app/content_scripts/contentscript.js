'use strict';

(function(chrome, $) {

	function gup(name) {
		name = name.replace(/[[]/, '[').replace(/[]]/, ']');
		var regexS = '[\\?&]' + name + '=([^&#]*)';
		var regex = new RegExp(regexS);
		var results = regex.exec(window.location.href);
		if (results === null)
			return null;
		else return results[1];
	}

	if (gup('extension') !== 'true') {
		return false;
	}

	function randomNumber(first, last){
		return Math.floor((Math.random() * last) + first);
	}

	function executeInDocument(fn) {
		var actualCode = '(' + fn + ')();';
		var script = document.createElement('script');
		script.textContent = actualCode;
		(document.head || document.documentElement).appendChild(script);
		script.parentNode.removeChild(script);
	}

	function isLogged() {
		return $('html').find('form.loginForm').length === 0;
	}

	function getToken() {
		try {
			executeInDocument(function() {
				$('body').append(
					$('<input/>', {
						id: 'csrf_token',
						type: 'hidden'
					}).val(P.csrf.getCSRFToken()) //jshint ignore:line
				);
			});

			var $inputToken = $('body > #csrf_token');
			var token = $inputToken.val();
			$inputToken.remove();
			return token;
		} catch (e) {
			return null;
		}
	}

	var IS_LOGGED = isLogged(),
		USERNAME = 'tomymolina',
		TOKEN = IS_LOGGED ? getToken() : null;

	function sendError(errorName, errorMsg, sender) {
		//TODO: better error managment
		sender({
			error: {
				name: errorName,
				msg: errorMsg
			}
		});
	}

	function sendSuccess(data, sender) {
		sender({
			data: data
		});
	}

	function processRequest(request, sender, sendResponse) {

		//TODO: check
		if (sender.tab) {
			throw new Error('Messages only allowed from background page');
		}

		if (!TOKEN && IS_LOGGED) {
			sendError('INVALID_TOKEN', null, sendResponse);	
		}

		console.info('CONTENTSCRIPT ACTION: ' + request.action, request.data);


		switch (request.action) {
			case 'publish-pin':
				publishPin(request.data, request.SESSION_SECRET, sendResponse);
				break;
			case 'get-boards':
				getBoards(request.data, request.SESSION_SECRET, sendResponse);
				break;
			case 'get-username':
				getUsername(request.SESSION_SECRET, sendResponse);
				break;
			default:
				sendError('INVALID_ACTION', request.action, sendResponse);

		}

		//make async
		return true;
	}

	function publishPin(pin, SESSION_SECRET, sendResponse) {
		if (isLogged === false) {
			sendError('NOT_LOGGED', null, sendResponse);
			return;
		}

		if (pin instanceof Object === false) {
			sendError('INVALID_PIN', pin, sendResponse);
			return;
		}

		if (typeof pin.board !== 'string' || typeof pin.description !== 'string' || typeof pin.mediaPage !== 'string' || typeof pin.mediaUrl !== 'string') {
			sendError('INVALID_PIN', pin, sendResponse);
			return;
		}

		var formData = {
			'source_url': '/pin/create/bookmarklet/',
			'data': {
				'options': {
					'board_id': pin.board,
					'description': pin.description,
					'link': pin.mediaPage,
					'share_twitter': false,
					'share_facebook': false,
					'image_url': pin.mediaUrl,
					'method': 'bookmarklet',
					'is_video': null
				},
				'context': {}
			}
		};

		$.ajax({
			url: 'https://www.pinterest.com/resource/PinResource/create/',
			contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
			type: 'POST',
			headers: {
				'X-CSRFToken': TOKEN,
				'X-session-secret': SESSION_SECRET
			},
			data: {
				'source_url': formData['source_url'], //jshint ignore:line
				'data': JSON.stringify(formData.data)
			},
			success: function(data) {
				//TODO: better success handling
				sendSuccess({
					html: data
				}, sendResponse);
			},
			error: function(err) {
				sendError('PIN_AJAX_ERROR', err, sendResponse);
			}
		});
	}

	function getBoards(options, SESSION_SECRET, sendResponse) {
		if (IS_LOGGED === false) {
			sendError('NOT_LOGGED', null, sendResponse);
			return;
		}

		if (options instanceof Object === false){
			sendError('INVALID_BOARD_OPTIONS', options, sendResponse);
			return;
		}

		if(typeof options.username !== 'string'){
			sendError('INVALID_BOARD_USERNAME', options.username, sendResponse);
			return;
		}

		var formData = {
			'source_url': '/' + options.username + '/',
			'data': {
				'options': {
					'field_set_key': 'grid_item',
					'username': options.username,
				},
				'context': {}
			},
			'_' : randomNumber(0, 2e9)
		};

		$.ajax({
			url: 'https://www.pinterest.com/resource/ProfileBoardsResource/get/',
			type: 'GET',
			headers: {
				'X-CSRFToken': TOKEN,
				'X-session-secret': SESSION_SECRET
			},
			data: {
				'source_url': formData['source_url'], //jshint ignore:line
				'data': JSON.stringify(formData.data)
			},
			success: function(data) {
				//TODO: better success handling
				if (data.resource_response && data.resource_response.data){ //jshint ignore:line
					sendSuccess(data.resource_response.data.slice(1), sendResponse); //jshint ignore:line
				} else {
					sendError('INVALID_BOARDS_RESPONSE', data, sendResponse);
				}

				
			},
			error: function(err) {
				sendError('BOARDS_AJAX_ERROR', err, sendResponse);
			}
		});
	}

	function getUsername(SESSION_SECRET, sendResponse){
		if (IS_LOGGED === false){
			sendError('NOT_LOGGED', null, sendResponse);
			return;
		}

		var formData = {
			'source_url': '/',
			'data': {
				'options': {},
				'context': {}
			},
			'_' : randomNumber(0, 2e9)
		};

		$.ajax({
			url: 'https://www.pinterest.com/resource/UserSettingsResource/get/',
			type: 'GET',
			headers: {
				'X-CSRFToken': TOKEN,
				'X-session-secret': SESSION_SECRET
			},
			data: {
				'source_url': formData['source_url'], //jshint ignore:line
				'data': JSON.stringify(formData.data)
			},
			success: function(data) {
				//TODO: better success handling
				if (data.resource_response && data.resource_response.data){ //jshint ignore:line
					sendSuccess(data.resource_response.data.username, sendResponse); //jshint ignore:line
				} else {
					sendError('INVALID_USERNAME_RESPONSE', data, sendResponse);
				}	
			},
			error: function(err) {
				sendError('USERNAME_AJAX_ERROR', err, sendResponse);
			}
		});
	}

	/**
	 * Public interface
	 */
	chrome.runtime.onMessage.addListener(processRequest);

})(window.chrome, window.$);

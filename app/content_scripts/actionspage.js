'use strict';

(function(chrome, $, gup, processRequest) {

	if (location.pathname !== '/pin/create/extension/' || gup('extension') !== 'true') {
		return;
	}

	console.info('### Actions page loaded ###', location.pathname);

	function randomNumber(first, last) {
		return Math.floor((Math.random() * last) + first);
	}

	//TODO: better error handing
	function publishPin(pin, request, sendSuccess, sendError) {
		if (pin instanceof Object === false) {
			sendError('INVALID_PIN', pin);
			return;
		}

		if (typeof pin.board !== 'string' || typeof pin.description !== 'string' || typeof pin.mediaPage !== 'string' || typeof pin.mediaUrl !== 'string') {
			sendError('INVALID_PIN', pin);
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
				'X-CSRFToken': request.TOKEN,
				'X-session-secret': request.SESSION_SECRET
			},
			data: {
				'source_url': formData['source_url'], //jshint ignore:line
				'data': JSON.stringify(formData.data)
			},
			success: function(data) {
				//TODO: better success handling
				sendSuccess({
					html: data
				});
			},
			error: function(err) {
				sendError('PIN_AJAX_ERROR', err);
			}
		});
	}

	function getBoards(options, request, sendSuccess, sendError) {
		if (options instanceof Object === false) {
			sendError('INVALID_BOARD_OPTIONS', options);
			return;
		}

		if (typeof options.username !== 'string') {
			sendError('INVALID_BOARD_USERNAME', options.username);
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
			'_': randomNumber(0, 2e9)
		};

		$.ajax({
			url: 'https://www.pinterest.com/resource/ProfileBoardsResource/get/',
			type: 'GET',
			headers: {
				'X-CSRFToken': request.TOKEN,
				'X-session-secret': request.SESSION_SECRET
			},
			data: {
				'source_url': formData['source_url'], //jshint ignore:line
				'data': JSON.stringify(formData.data)
			},
			success: function(data) {
				//TODO: better success handling
				if (data.resource_response && data.resource_response.data) { //jshint ignore:line
					sendSuccess(data.resource_response.data.slice(1)); //jshint ignore:line
				} else {
					sendError('INVALID_BOARDS_RESPONSE', data);
				}


			},
			error: function(err) {
				sendError('BOARDS_AJAX_ERROR', err);
			}
		});
	}

	function getUsername(data, request, sendSuccess, sendError) {

		var formData = {
			'source_url': '/',
			'data': {
				'options': {},
				'context': {}
			},
			'_': randomNumber(0, 2e9)
		};

		$.ajax({
			url: 'https://www.pinterest.com/resource/UserSettingsResource/get/',
			type: 'GET',
			headers: {
				'X-CSRFToken': request.TOKEN,
				'X-session-secret': request.SESSION_SECRET
			},
			data: {
				'source_url': formData['source_url'], //jshint ignore:line
				'data': JSON.stringify(formData.data)
			},
			success: function(data) {
				//TODO: better success handling
				if (data.resource_response && data.resource_response.data) { //jshint ignore:line
					sendSuccess(data.resource_response.data.username); //jshint ignore:line
				} else {
					sendError('INVALID_USERNAME_RESPONSE', data);
				}
			},
			error: function(err) {
				sendError('USERNAME_AJAX_ERROR', err);
			}
		});
	}

	function validRequest(request, sender, sendError) {

		if (!processRequest.VALIDATORS.fromBackground.apply(this, arguments)) { //jshint ignore: line
			sendError('NOT_FROM_BACKGROUND', sender);
			return false;
		} else if (typeof request.TOKEN !== 'string') {
			sendError('INVALID_TOKEN', request.TOKEN);
			return false;
		} else if (typeof request.SESSION_SECRET !== 'number') {
			sendError('INVALID_SESSION_SECRET', request.SESSION_SECRET);
			return false;
		}

		return true;
	}

	/**
	 * Public interface
	 */
	chrome.runtime.onMessage.addListener(processRequest({
			'get-boards': getBoards,
			'get-username': getUsername,
			'publish-pin': publishPin
		}, validRequest));

})(window.chrome, window.$, window.gup, window.processRequest);

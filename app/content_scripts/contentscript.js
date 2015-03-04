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

		if (!TOKEN){
			sendError('INVALID_TOKEN', null, sendResponse);
		}


		switch (request.action) {
			case 'publish-pin':
				publishPin(request.data, request.SESSION_SECRET, sendResponse);
				break;
			case 'get-boards':
				getBoards(request.SESSION_SECRET, sendResponse);
				break;
			default:
				sendError('INVALID_ACTION', request.action, sendResponse);

		}

		//make async
		return true;
	}

	function publishPin(pin, SESSION_SECRET, sendResponse) {
		if (pin instanceof Object === false){
			sendError('INVALID_PIN', pin, sendResponse);
			return;
		}

		if (typeof pin.board !== 'string' ||  typeof pin.description !== 'string' || typeof pin.mediaPage !== 'string' || typeof pin.mediaUrl !== 'string'){
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
				sendError('AJAX_ERROR', err, sendResponse);
			}
		});
	}

	function getBoards(TOKEN, sendResponse) {
		if (isLogged === false) {
			sendError('NOT_LOGGED', null, sendResponse);
		}

		sendSuccess([{id: 'bueno'}, {id: 'bonito'}, {id:'barato'}], sendResponse);

		var boards = [];

		$('ul.section > ul.sectionItems > li.item').each(function(item, index) {
			/*boards.push({
				name: $.trim($(item).find('.nameAndIcons').text()),
				collab: $(item).find('.BoardIcons > .collaborativeIcon').length,
				id: 
			});*/
		});
	}

	/**
	 * Public interface
	 */
	chrome.runtime.onMessage.addListener(processRequest);

})(window.chrome, window.$);

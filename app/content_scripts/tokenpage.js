'use strict';

(function(chrome, $, gup, processRequest) {

	if (location.pathname !== '/pin/create/bookmarklet/' || gup('extension') !== 'true') {
		return;
	}

	console.info('### Token page loaded ###', location.pathname);

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

	function getDocumentToken() {
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

	function getToken(data, request, sendSuccess, sendError){
			var token = getDocumentToken();
			if (token){
				sendSuccess(token);
			} else {
				if (isLogged()){
					sendError('UNKNOWN_TOKEN_ERROR', null);
				} else {
					sendError('NOT_LOGGED', null);
				}
			}
		}

	chrome.runtime.onMessage.addListener(processRequest({
		'get-token' : getToken
	}, processRequest.VALIDATORS.fromBackground));
})(window.chrome, window.$, window.gup, window.processRequest);

'use strict';

(function() {
	function gup(name) {
		name = name.replace(/[[]/, '[').replace(/[]]/, ']');
		var regexS = '[\\?&]' + name + '=([^&#]*)';
		var regex = new RegExp(regexS);
		var results = regex.exec(window.location.href);
		if (results === null)
			return null;
		else return results[1];
	}

	function sendError(errorName, errorMsg) {
		if (typeof this.sendResponse !== 'function'){ //jshint ignore:line
			throw new Error('Invalid context sendResponse');
		}

		this.sendResponse({ //jshint ignore:line
			error: {
				name: errorName,
				msg: errorMsg
			}
		});
	}

	function sendSuccess(data) {
		if (typeof this.sendResponse !== 'function'){ //jshint ignore:line
			throw new Error('Invalid context sendResponse');
		}

		this.sendResponse({ //jshint ignore:line
			data: data
		});
	}

	function processRequest(actions, comprobation) {
		return function(request, sender, sendResponse) {
			if (request instanceof Object === false) {
				throw new Error('Invalid request');
			}

			if (typeof comprobation !== 'function' || comprobation(request, sender, sendError.bind({sendResponse : sendResponse})) === true) {
				if (request.action in actions && typeof actions[request.action] === 'function') {
					actions[request.action].call(this, request.data, request, sendSuccess.bind({sendResponse: sendResponse}), sendError.bind({sendResponse: sendResponse}));
					return true;
				} else {
					throw new Error('Invalid action: ' + request.action);
				}
			}

			return true;
		};
	}

	processRequest.VALIDATORS = {
		fromBackground : function(request, sender){
			if (sender.tab){
				return false;
			}

			return true;
		},
	};

	window.gup = gup;
	window.processRequest = processRequest;

	//console.info('### Pinterest page loaded ###', location.pathname);
})();

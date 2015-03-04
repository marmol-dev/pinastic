'use strict';

(function(Settings, Boards, Pins, contextualMenu, PinterestAPI, _) {

	var SESSION_SECRET = _.random(0, 2e9);

	window.chrome.webRequest.onHeadersReceived.addListener(
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

	(function initialize() {

		var settings = new Settings({}, {
				localStorageKey: 'settings'
			}),
			boards = new Boards([], {
				localStorageKey: 'boards'
			}),
			pins = new Pins([], {
				localStorageKey: 'pins'
			});

		contextualMenu.init({
			settings: settings,
			boards: boards,
			pins: pins
		});

		PinterestAPI.init(SESSION_SECRET);

		settings.on('change', contextualMenu.update);
		boards.on('reset', contextualMenu.update);
		pins.on('published', contextualMenu.update);
		//pins.on('published', notification.successPin);

		window.boards = boards;
	})();

	window.SESSION_SECRET = SESSION_SECRET;

})(window.Settings, window.Boards, window.Pins, window.contextualMenu, window.PinterestAPI, window._);

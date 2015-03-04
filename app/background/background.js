'use strict';

(function(Settings, Boards, Pins, contextualMenu) {

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

		settings.on('change', contextualMenu.update);
		boards.on('reset', contextualMenu.update);
		pins.on('published', contextualMenu.update);
		//pins.on('published', notification.successPin);

		window.boards = boards;
	})();

})(window.Settings, window.Boards, window.Pins, window.contextualMenu, window.PinterestAPI, window._);

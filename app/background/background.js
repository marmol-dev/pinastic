'use strict';

(function(Settings, Boards, Pins, contextualMenu) {

	(function initialize() {

		var settings = new Settings({}, {
				localStorageKey: 'settings'
			}),
			boards = new Boards([], {
				localStorageKey: 'boards',
				settings : settings,
			}),
			pins = new Pins([], {
				localStorageKey: 'pins'
			});

		if (!settings.get('username')){

		}

		contextualMenu.init({
			settings: settings,
			boards: boards,
			pins: pins
		});

		settings.on('change', contextualMenu.update);
		boards.on('reset', contextualMenu.update);
		pins.on('published', boards.fetch.bind(boards));
		//pins.on('published', notification.successPin);

		window.boards = boards;
	})();

})(window.Settings, window.Boards, window.Pins, window.contextualMenu, window.PinterestAPI, window._);

'use strict';

(function(Settings, Boards, Pins, contextualMenu, notifications) {

	(function initialize() {

		var settings = new Settings({}, {
				localStorageKey: 'settings'
			}),
			boards = new Boards([], {
				updateOnlyOnReset: true,
				localStorageKey: 'boards',
				settings : settings

			}),
			pins = new Pins([], {
				localStorageKey: 'pins'
			});

		contextualMenu.init({
			settings: settings,
			boards: boards,
			pins: pins
		});

		notifications.init({
			settings: settings,
			boards: boards,
		});

		settings.on('change', contextualMenu.update);
		boards.on('reset', contextualMenu.update);
		pins.on('published', boards.fetch.bind(boards));
		pins.on('published', notifications.successPin);

		window.boards = boards;
		window.pins = pins;
		window.settings = settings;
		
	})();

})(window.Settings, window.Boards, window.Pins, window.contextualMenu, window.notifications);

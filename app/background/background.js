'use strict';

(function(Settings, Boards, Pins, contextualMenu, notifications, PinterestAPI) {

	(function initialize() {

		/*
		 * Init deeper layer: API layer
		 */
		PinterestAPI.init(function(err) {
			if (err) {
				console.error(err);
				return;
			}

			/*
			 * Init Models and Collections layer
			 */
			var settings = new Settings({}, {
					localStorageKey: 'settings'
				}),
				boards = new Boards([], {
					updateOnlyOnReset: true,
					localStorageKey: 'boards',
					settings: settings

				}),
				pins = new Pins([], {
					localStorageKey: 'pins'
				});

			/*
			 * Init user-visible layers
			 */
			contextualMenu.init({
				settings: settings,
				boards: boards,
				pins: pins
			});

			notifications.init({
				settings: settings,
				boards: boards,
			});


			/*
			 * Wrap all events between layers
			 */
			settings.on('change', contextualMenu.update);
			boards.on('reset', contextualMenu.update);
			pins.on('published', boards.fetch.bind(boards));
			pins.on('published', notifications.successPin);

			/*
			 * Export models and collections for debugging purposes
			 */
			window.boards = boards;
			window.pins = pins;
			window.settings = settings;
		});

	})();

})(window.Settings, window.Boards, window.Pins, window.contextualMenu, window.notifications, window.PinterestAPI);

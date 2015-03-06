'use strict';

(function(chrome, Backbone, _) {

	var settings,
		boards;

	var Notification = Backbone.Model.extend({
		defaults: {
			id: null,
			title: null,
			message: null,
			iconUrl: '/modules/core/images/icon-16.png',
			imageUrl: null,
			buttons: null,

		},
		validAttributes: function(attrs) {
			console.warn(attrs);
			if (typeof attrs.title === 'string' && typeof attrs.message === 'string') {
				return true;
			} else {
				return false;
			}
		},
		initialize: function(attrs, options) {
			if (!this.validAttributes(attrs)) {
				throw new Error('Invalid attributes');
			}

			if (options instanceof Object) {
				if (options.autoDisplay) {
					this.displayDialog();
				}

				if (options.autoClose > 0) {
					this.on('displayed', function() {
						window.setTimeout(this.closeDialog.bind(this), options.autoClose);
					}.bind(this));
				}
			}
		},
		getNotificationProperties: null,
		displayDialog: function() {
			chrome.notifications.create(this.get('id').toString(), this.getNotificationProperties(), function() {
				this.trigger('displayed');
			}.bind(this));
		},
		closeDialog: function() {
			chrome.notifications.clear(this.get('id').toString(), function() {
				this.trigger('closed');
			}.bind(this));
		}
	});

	var ImageNotification = Notification.extend({
		validImageAttribues: function(attrs) {
			if (typeof attrs.imageUrl !== 'string') {
				return false;
			} else {
				return true;
			}
		},
		initialize: function(attrs) {
			if (!this.validImageAttribues(attrs)) {
				throw new Error('Invalid image attributes');
			}

			this.constructor.__super__.initialize.apply(this, arguments);
		},
		getNotificationProperties: function() {
			return {
				title: this.get('title'),
				message: this.get('message'),
				type: 'image',
				iconUrl: this.get('iconUrl'),
				imageUrl: this.get('imageUrl')
			};
		}
	});

	function successPin(pin) {
		if (!settings) {
			throw new Error('Settings not initializated');
		}

		if (settings.get('general-pinning')['success-message'] !== true) {
			return;
		}

		console.log('before creating notification for pin:', pin);

		new ImageNotification({
			id: _.random(1, 2e9),
			title: 'Successfully pinned in "' + boards.get(pin.get('board')).get('name') + '"',
			message: pin.get('description'),
			imageUrl: pin.get('mediaUrl'),
			iconUrl: 'modules/core/images/icon-128.png'
		}, {
			autoDisplay: true,
			autoClose: settings.get('general-pinning.success-message-time')
		});
	}


	window.Notification = Notification;
	window.ImageNotification = ImageNotification;

	window.notifications = {
		init: function(data) {
			settings = data.settings;
			boards = data.boards;
		},
		successPin: successPin,
	};


})(window.chrome, window.Backbone, window._);

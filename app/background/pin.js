'use strict';

(function(Backbone,  PinterestAPI) {

	if (PinterestAPI instanceof Object === false) {
		throw new Error('Invalid PinterestAPI');
	}

	if (typeof PinterestAPI.publishPin !== 'function') {
		throw new Error('Invalid PinterestAPI publishPin public interface');
	}

	var Pin = Backbone.Model.extend({
		defaults: {
			date: null,
			description: ' ',
			board: null,
			mediaUrl: null,
			mediaPage: null,
			published: false
		},
		//TODO: validate
		initialize: function() {

		},
		publish: function publish() {
			if (this.get('published') === true) {
				throw new Error('Pin already published');
			}

			console.info('Publishing pin', this);
			PinterestAPI.publishPin(this.toJSON(), function(err) {
				if (err) {
					throw new Error(err.name);
				}

				console.log('Published pin');

				this.set({
					published: true,
					date: new Date()
				});

				this.trigger('published', this);
			}.bind(this));
		},
	});

	var Pins = Backbone.LocalStorageCollection.extend({
		model: Pin,
		initialize: function() {}
	});

	window.Pins = Pins;

})(window.Backbone, window.PinterestAPI);

'use strict';

(function(Backbone, BackboneLocalStorage, boards, PinterestAPI) {

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

				this.set({
					published : true,
					date: new Date()
				});

				this.trigger('published');
			}.bind(this));
		},
	});

	var Pins = BackboneLocalStorage.Collection.extend({
		model: Pin,
		initialize: function() {}
	});

	window.Pins = Pins;

})(window.Backbone, window.BackboneLocalStorage, window.boards, window.PinterestAPI);

'use strict';

(function(Backbone, _, PinterestAPI) {

	/**
	 * Interfaces validation
	 */

	if (PinterestAPI instanceof Object === false){
	 	throw new Error('Invalid PinterestAPI');
	}

	if (typeof PinterestAPI.getUsername !== 'function'){
		throw new Error('Invalid PinterestAPI getUsername public interface');
	}

	var settingsDefaults = {
		'language': 'en',
		'context-menu': {
			'active': false,
			'autosubmit': false,
			'description-autofill': true,
			'recent-boards': 3
		},
		'general-pinning': {
			'success-message': true,
			'success-message-time': 3000,
			'simultaneous-pins': 3
		},
		'username': null,
	};

	var Settings = Backbone.DeepModel.extend({
		defaults : settingsDefaults,
		constructor : function(){
			Backbone.DeepModel.apply(this, arguments);
			_.extend(this, Backbone.LocalStorageModel.prototype);
			Backbone.LocalStorageModel.apply(this, arguments);
		},
		fetchingUsername : false,
		fetchUsername : function(){
			if (this.fetchingUsername === false){
				this.fetchingUsername = true;
				PinterestAPI.getUsername(function(err, username){
					this.fetchingUsername = false;
					if (!err){
						this.set('username', username);
						console.info('Fetched username');
					}
					this.trigger('fetchedUsername', err, username);
				}.bind(this));
			}
		}
	});

	window.Settings = Settings;

})(window.Backbone, window._, window.PinterestAPI);

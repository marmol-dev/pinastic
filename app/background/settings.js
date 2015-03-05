'use strict';

(function(BackboneLocalStorage, PinterestAPI) {

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
			'simultaneous-pins': 3
		},
		'username': null,
	};

	var Settings = BackboneLocalStorage.Model.extend({
		defaults : settingsDefaults,
		initialize : function(){
		},
		fetchingUsername : false,
		fetchUsername : function(){
			if (this.fetchingUsername === false){
				console.info('Fetching username');
				this.fetchingUsername = true;
				PinterestAPI.getUsername(function(err, username){
					this.fetchingUsername = false;
					if (!err){
						this.set('username', username);
					}
					this.trigger('fetchedUsername', err, username);
				}.bind(this));
			}
		}
	});

	window.Settings = Settings;

})(window.BackboneLocalStorage, window.PinterestAPI);
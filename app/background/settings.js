'use strict';

(function(BackboneLocalStorage) {

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
		}
	};

	var Settings = BackboneLocalStorage.Model.extend({
		defaults : settingsDefaults,
		initialize : function(){}, 
	});

	window.Settings = Settings;

})(window.BackboneLocalStorage);
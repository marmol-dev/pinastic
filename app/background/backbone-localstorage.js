'use strict';

(function(window) {

	var _,
		Backbone;

	/**
	 * Dependencies
	 */
	 //TODO: better requiring dependencies
	if (typeof require === 'function'){
		_ = require('lodash') || require('underscore');
		Backbone = require('backbone');
	} else {
		_ = window._;
		Backbone = window.Backbone;

		var unresolvedDependencies = [];

		if (!_){
			unresolvedDependencies.push('lodash (or underscore)');
		}

		if (!Backbone){
			unresolvedDependencies.push('Backbone');
		}

		if (unresolvedDependencies.length > 0){
			throw new Error('Unresolved dependencies: ', unresolvedDependencies.join(','));
		}
	}

	var BackboneLocalStorage = {};

	/**
	 * localStorage management 
	 */
	var lS = (function() {
		var localStorage = window.localStorage;

		function set(name, value) {
			localStorage[name] = JSON.stringify(value);
		}

		function get(name) {
			var unparsedValue = localStorage[name],
				parsedValue;

			try {
				parsedValue = JSON.parse(unparsedValue);
			} catch (e) {
				parsedValue = unparsedValue;
			}

			return parsedValue;
		}

		return function(name, value) {
			if (arguments.length === 2)
				return set(name, value);
			else return get(name);
		};
	})();


	var Model = Backbone.Model.extend({
		constructor: function(attrs, options) {

			if (!_.isObject(options)) {
				throw new Error('Invalid options object');
			}

			if (typeof options.localStorageKey !== 'string') {
				throw new Error('Invalid localStorageKey in constructor options');
			}

			this.$localStorageKey = options.localStorageKey;

			Backbone.Model.apply(this, arguments);

			this.on('change', this.$updateLocalStorage.bind(this));

			//localstorage
			if (!lS(this.$localStorageKey)) {
				lS(this.$localStorageKey, []);
			}

			this.$updateCollection.call(this);
		},
		$updateCollection: function() {
			this.set(lS(this.$localStorageKey));
		},
		$updateLocalStorage: function() {
			this.trigger('localStorageUpdated');
			lS(this.$localStorageKey, this.toJSON());
		}
	});

	var Collection = Backbone.Collection.extend({
		constructor: function(items, options) {
			//options validation
			if (!_.isObject(options)) {
				throw new Error('Invalid options object');
			}

			if (typeof options.localStorageKey !== 'string') {
				throw new Error('Invalid localStorageKey in constructor options');
			}

			this.$localStorageKey = options.localStorageKey;

			//parent constructor
			Backbone.Collection.apply(this, arguments);

			//events
			_.extend(this, Backbone.Events);
			var eventsToUpdate = ['reset'];
			if (options.updateOnlyOnReset !== true) {
				eventsToUpdate.push('add');
				eventsToUpdate.push('remove');
			}

			this.on(eventsToUpdate.join(' '), this.$updateLocalStorage.bind(this));

			//localstorage
			if (!lS(this.$localStorageKey)) {
				lS(this.$localStorageKey, []);
			}

			this.$updateCollection.call(this);
		},
		$updateCollection: function() {
			this.set(lS(this.$localStorageKey) );
		},
		$updateLocalStorage: function() {
			this.trigger('localStorageUpdated');
			lS(this.$localStorageKey, this.toJSON());
		}
	});

	BackboneLocalStorage.Model = Model;
	BackboneLocalStorage.Collection = Collection;
	BackboneLocalStorage.lS = lS;

	//export
	if (typeof module === 'object' && module && typeof module.exports === 'object') {
		module.exports = BackboneLocalStorage;
	} else {
		window.BackboneLocalStorage = BackboneLocalStorage;

		if (typeof define === 'function' && define.amd) { /*jshint ignore: line */
			define('BackboneLocalStorage', [], function() {  /*jshint ignore: line */
				return BackboneLocalStorage;
			});
		}
	}

})(this);  /*jshint ignore: line */

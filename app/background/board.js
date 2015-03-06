'use strict';

(function(Backbone, BackboneLocalStorage, PinterestAPI, Settings) {

	/**
	 * Interfaces validation
	 */

	if (PinterestAPI instanceof Object === false){
	 	throw new Error('Invalid PinterestAPI');
	}

	if (typeof PinterestAPI.getBoards !== 'function'){
		throw new Error('Invalid PinterestAPI getBoards public interface');
	}


	var Board = Backbone.Model.extend({
		defaults : {
			'id': null,
			'name': null,
			'is_collaborative': false,
		},
		initialize: function() {

		}
	});

	var Boards = BackboneLocalStorage.Collection.extend({
		model: Board,
		initialize : function(boards, options) {
			if (options.settings instanceof Settings === false){
				throw new Error('Invalid boards option\'s settings');
			}

			this.settings = options.settings;
		}, 
		recent : function(n){
			//TODO: create
			return this.models.slice(0, n);
		},
		fetch : function(){
			var settings = this.settings,
				boards = this,
				fetchArguments = arguments;

			if (!settings.get('username')){
				settings.on('fetchedUsername', function(err){
					if (!err){
						boards.fetch.apply(boards, fetchArguments);
					}
				});
				settings.fetchUsername();
				return;
			}

			PinterestAPI.getBoards({username: settings.get('username')}, function(err, res){
				if (err){
					console.error(err);
				} else {
					console.info('Fetched boards');
					this.reset(res, {reset:true});
				}
				this.trigger('fetched', err, res);					
			}.bind(this));
		}
	});

	window.Boards = Boards;

})(window.Backbone, window.BackboneLocalStorage, window.PinterestAPI, window.Settings);
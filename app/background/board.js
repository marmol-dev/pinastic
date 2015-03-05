'use strict';

(function(Backbone, BackboneLocalStorage, PinterestAPI, Settings) {
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
		recent : function(){
			//TODO: create
			return this.models.slice(0, 5);
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

			console.info('Fetching boards', this);
			PinterestAPI.getBoards({username: settings.get('username')}, function(err, res){
				if (err){
					console.error(err);
				} else {
					this.set(res);
				}
				this.trigger('fetched', err, res);					
			}.bind(this));
		}
	});

	window.Boards = Boards;

})(window.Backbone, window.BackboneLocalStorage, window.PinterestAPI, window.Settings);
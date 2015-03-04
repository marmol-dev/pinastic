'use strict';

(function(Backbone, BackboneLocalStorage, PinterestAPI) {
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
		initialize : function() {
			
		}, 
		recent : function(){
			//TODO: create
			return this.models.slice(0, 5);
		},
		fetch : function(){
			PinterestAPI.get('boards', null, function(err, res){
				this.set(res);
			}.bind(this));
		}
	});

	window.Boards = Boards;

})(window.Backbone, window.BackboneLocalStorage, window.PinterestAPI);
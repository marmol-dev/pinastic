'use strict';

(function(chrome, async, _) {
	var boards,
		settings,
		pins;


	var parentMenu;

	function wrapRecentBoards(finish) {
		var recentBoards = settings.get('context-menu.recent-boards');
		var recent = _.map(boards.recent(recentBoards), function(board) {
			return board.toJSON();
		});
		async.each(recent, function(board, callback) {
			var boardMenuProperties = {
				title: board.name,
				id: board.id + '/recent',
				parentId: parentMenu,
				contexts: ['image']
			};
			chrome.contextMenus.create(boardMenuProperties, callback);
		}, finish);
	}

	function wrapSeparator(finish) {
		var separatorProperties = {
			type: 'separator',
			parentId: parentMenu,
			contexts: ['image']
		};
		chrome.contextMenus.create(separatorProperties, finish);
	}

	function wrapAllBoards(finish) {
		var all = boards.toJSON();
		async.each(all, function(board, callback) {
			//TODO: collaborative mark
			var boardMenuProperties = {
				title: board.name,
				id: board.id + '/all',
				parentId: parentMenu,
				contexts: ['image']
			};
			chrome.contextMenus.create(boardMenuProperties, callback);
		}, finish);
	}

	function createChildrenMenus(callback) {
		async.parallel([wrapRecentBoards, wrapSeparator, wrapAllBoards], callback);
	}

	function createParentMenu(callback) {
		//TODO: create based on the data
		//create menu
		var topMenuProperties = {
			type: 'normal',
			id: Math.floor(Math.random() * 9e9).toString(),
			title: 'Pin this image with Pinastic',
			contexts: ['image']
		};

		parentMenu = chrome.contextMenus.create(topMenuProperties, function() {
			createChildrenMenus(callback);
		});
	}

	function removeParentMenu(callback) {
		if (parentMenu) {
			chrome.contextMenus.remove(parentMenu, function(){
				parentMenu = null;
				callback.apply(this, arguments);
			});
		} else throw new Error('INVALID_PARENT_MENU');
	}

	function updateMenus(callback) {

		console.info('Update context menu');

		if (typeof callback !== 'function'){
			callback = function(){
				//console.info('contextualMenu updated', boards.toJSON());
			};
		}

		if (parentMenu) {
			removeParentMenu(function() {
				createParentMenu(callback);
			});
		} else {
			createParentMenu(callback);
		}
	}

	function onContextClicked(menuInfo, tab) {
		//check if it wasn't the parent menu
		if (menuInfo.menuItemId !== parentMenu) {

			var pin = pins.add({
				board: menuInfo.menuItemId.match(/([\w]{1,})\/(recent|all)/)[1],
				mediaPage: menuInfo.srcUrl,
				mediaUrl: tab.url,
				//TODO: :create function that gets the description using settings
				description: 'GET_DESCRIPTION',
			});

			console.info('pin', pin);

			pin.publish();
		}
	}

	function init(data) {
		boards = data.boards;
		pins = data.pins;
		settings = data.settings;
		chrome.contextMenus.onClicked.addListener(onContextClicked);
		updateMenus();
	}

	window.contextualMenu = {
		init: init,
		update: updateMenus
	};
	
})(window.chrome, window.async, window._);

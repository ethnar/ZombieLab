'use strict';

angular.module('ZombieLabApp')

.service('equipmentService', function () {
	var service = this;

	service.items = {};

	service.registerItem = function (item) {
		item.price = item.price || 0;
		item.size = item.size || 'small';
		item.isLarge = item.isLarge || false;
		service.items[item.name] = item;
	};

	service.registerItems = function (data) {
		_.each(data, function (items, category) {
			_.each(items, function (item) {
				item.category = category;
				service.registerItem(item);
			});
		});
	};

	service.newItemByName = function (itemName) {
		return service.newItem(service.items[itemName]);
	};

	service.newItem = function (item) {
		var newItem = {
			model: item
		};
		if (item.category === 'weapon') {
			newItem.ammo = item.clipSize;
		}
		return newItem;
	};
});

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
		if (!service.items[itemName]) {
			throw new Error('No such item as ' + itemName);
		}
		return service.newItem(service.items[itemName]);
	};

	service.newItem = function (itemModel) {
		var newItem = {
			model: itemModel
		};
		if (itemModel.category === 'weapon') {
			newItem.ammo = itemModel.clipSize;
		} else {
			newItem.charges = itemModel.charges;
		}
		return newItem;
	};
});

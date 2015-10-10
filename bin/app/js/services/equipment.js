'use strict';

angular.module('ZombieLabApp')

.service('equipmentService', function () {
	var service = this;

	service.itemTypesByName = {};
	service.itemTypes = {};
	service.ammo = {};

	service.registerItem = function (item) {
		item.price = item.price || 0;
		item.size = item.size || 'small';
		item.isLarge = item.isLarge || false;
		service.itemTypes[item.category] = service.itemTypes[item.category] || {};
		service.itemTypesByName[item.name] = item;
		service.itemTypes[item.category][item.name] = item;
	};

	service.registerItems = function (data) {
		_.each(data, function (items, category) {
			_.each(items, function (item) {
				item.category = category;
				service.registerItem(item);
			});
		});
	};

	service.removeAmmo = function () {
		_.each(service.ammo, function (qty, type) {
			service.ammo[type] = 0;
		});
	};

	service.addAmmo = function (type, qty) {
		service.ammo[type] = service.ammo[type] || 0;
		service.ammo[type] += qty;
	};

	service.newItemByName = function (itemName) {
		if (!service.itemTypesByName[itemName]) {
			throw new Error('No such item as ' + itemName);
		}
		return service.newItem(service.itemTypesByName[itemName]);
	};

	service.newItem = function (itemModel) {
		var newItem = {
			model: itemModel
		};
		if (itemModel.category === 'weapons') {
			newItem.ammo = itemModel.clipSize;
		} else {
			newItem.charges = itemModel.charges;
		}
		return newItem;
	};
});

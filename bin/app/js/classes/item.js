'use strict';

angular.module('ZombieLabApp')

.run(function (equipmentService, gameService, mapService, eventService) {
	var supportedEvents = ['Drop', 'Move'];

	window.Item = function (obj) {
		angular.extend(this, obj);
	};

	attachEventHandler(Item, supportedEvents);

	Item.prototype.drop = function (tile) {
		var key = _.findIndex(tile.itemSlots, function (slot) {
			return !slot.item;
		});
		if (key > -1) {
			tile.itemSlots[key].item = this;
			this.slot.item = null;
			this.slot = tile.itemSlots[key];
			this.fireDrop();
			return true;
		}
		console.error('No space to drop the item');
		return false;
	};
});


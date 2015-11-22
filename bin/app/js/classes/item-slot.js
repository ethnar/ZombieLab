'use strict';

angular.module('ZombieLabApp')

.run(function (equipmentService, gameService, mapService, eventService) {
	var supportedEvents = ['drop'];

	window.ItemSlot = function (item) {
		if (item) {
			this.item = item;
			item.slot = this;
		}
	};

	ItemSlot.prototype.swapWith = function (slot) {
		if (this.inUse || slot.inUse) {
			ZombieLab.error('Item in use, cannot swap now.');
			return;
		}

		var tempItem = this.item;
		this.item = slot.item;
		slot.item = tempItem;

		if (this.item) {
			this.item.slot = this;
			this.item.fireMove();
			if (this.slotType == 'floor') {
				this.item.fireDrop();
			}
		}
		if (slot.item) {
			slot.item.slot = slot;
			slot.item.fireMove();
			if (slot.slotType == 'floor') {
				slot.item.fireDrop();
			}
		}
	};
});


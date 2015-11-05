'use strict';

angular.module('ZombieLabApp')

.run(function (equipmentService, gameService, mapService, eventService) {
	var supportedEvents = ['LightsOff', 'LightsOn'];

	window.Tile = function (obj) {
		angular.extend(this, obj, {
			area: false,
			room: false,
			visible: false,
			enemies: [],
			itemSlots: [],
			teamHeat: 0,
			light: true,
			animations: {}
		});
		while (this.itemSlots.length < 8) {
			this.itemSlots.push(new ItemSlot());
		}
	};

	attachEventHandler(Tile, supportedEvents);

	Tile.prototype.isLit = function () {
		return this.light; // TODO: add fire
	};
	Tile.prototype.turnLight = function (light) {
		this.light = light;
		if (light) {
			this.fireLightsOn();
		} else {
			this.fireLightsOff();
		}
		mapService.checkVisibility();
	};

	Tile.prototype.hasItems = function () {
		return _.filter(this.itemSlots, function (slot) {
			return slot.item;
		}).length;
	};

});

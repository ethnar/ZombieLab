'use strict';

angular.module('ZombieLabApp')

.run(function (equipmentService, gameService, mapService, enemyService, eventService, characterService) {
	var supportedEvents = ['LightsOff', 'LightsOn', 'Miss', 'Explosion'];

	window.Tile = function (obj) {
		angular.extend(this, obj, {
			area: false,
			room: false,
			visible: false,
			enemies: [],
			itemSlots: [],
			icons: [],
			teamHeat: 0,
			searchProgress: Infinity,
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

	Tile.prototype.damage = function (dmgMin, dmgMax) {
		_.each(this.enemies, function (enemy) {
			enemyService.damage(enemy, _.random(dmgMin, dmgMax));
		});
		if (this === mapService.teamLocation) {
			_.each(characterService.team, function (character) {
				character.damage(_.random(dmgMin, dmgMax));
			});
		}
	}

});

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
			fire: 0,
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
		return this.light || this.fire; // TODO: add fire
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

	Tile.prototype.addIcon = function (name) {
		this.icons.push(name);
	};

	Tile.prototype.removeIcon = function (name) {
		this.icons = _.without(this.icons, _.findWhere(this.icons, name));
	};

	Tile.prototype.startFire = function (scale) {
		var self = this;
		if (self.fire) {
			self.removeIcon('fire' + self.fire);
		}
		self.fire = Math.min(3, self.fire + scale);
		self.addIcon('fire' + self.fire);
		eventService.onUpdate(function (delta) {
			var fireDamage = self.fire * 5 * delta / 1000;
			self.damage(fireDamage, fireDamage);
		});
	};

	Tile.prototype.hasItems = function () {
		return _.filter(this.itemSlots, function (slot) {
			return slot.item;
		}).length;
	};

	Tile.prototype.damage = function (dmgMin, dmgMax) {
		_.each(this.enemies, function (enemy) {
			enemyService.damage(enemy, _.random(dmgMin, dmgMax, true));
		});
		if (this === mapService.teamLocation) {
			_.each(characterService.team, function (character) {
				character.damage(_.random(dmgMin, dmgMax, true));
			});
		}
	}

});

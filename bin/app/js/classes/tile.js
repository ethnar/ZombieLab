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

	/* START Fire */
	Tile.prototype.getFireIcon = function () {
		return 'fire' + Math.max(1, Math.round(this.fire / 100));
	};

	Tile.prototype.normalizeFire = function () {
		this.fire = Math.max(0, Math.min(300, this.fire))
	};

	Tile.prototype.igniteFire = function (scale) {
		var self = this;
		var wasFire = self.fire;
		if (wasFire) {
			self.removeIcon(self.getFireIcon());
		}
		self.fire += scale * 100;
		self.flameTick = self.flameTick || 0;
		self.normalizeFire();
		self.addIcon(self.getFireIcon());
		if (!wasFire) {
			self.bindUpdate = eventService.onUpdate(function (delta) {
				var fireDamage = (self.fire / 20) * (delta / 1000);
				self.damage(fireDamage * 0.9, fireDamage * 1.1);

				self.flameTick += delta;
				while (self.flameTick > 1000) {
					self.flameTick -= 1000;
				}

				// TODO: also burn stuff
				if (self.flammable === undefined) { // not very elegant, but keep everything in one place
					self.flammable = self.room ? 3000 : 0;
				}
				if (self.flammable > 0) {
					self.igniteFire((delta / 1000) / 3);
					self.flammable -= self.fire * (delta / 1000);
				} else {
					self.extinguishFire((delta / 1000) / 5);
				}
			});
		}
	};

	Tile.prototype.extinguishFire = function (scale) {
		var self = this;
		if (!self.fire) {
			return;
		}
		self.removeIcon(self.getFireIcon());
		self.fire -= scale * 100;
		self.normalizeFire();
		if (self.fire) {
			self.addIcon(self.getFireIcon());
		} else {
			eventService.unbind(self.bindUpdate);
		}
	};
	/* END Fire */

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

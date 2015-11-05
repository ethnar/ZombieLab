'use strict';

angular.module('ZombieLabApp')

.run(function (equipmentService, gameService, mapService) {
	window.Character = function (obj) {
		angular.extend(this, obj);
	};

	attachEventHandler(Character, ['death']);

	Character.prototype.isReloading = function () {
		return this.reloadingTimer > 0 && this.alive;
	};

	Character.prototype.canPerformAction = function () {
		return this.conscious && this.alive;
	};

	Character.prototype.canShoot = function () {
		return this.conscious && this.active && this.alive;
	};

	Character.prototype.resetAim = function () {
		var characterRof = Math.floor(this.weapon.item.model.rof * Math.pow(this.skillModifier('weapons', this.weapon.item.model.skillRequired), 0.5));
		this.rofTimer += characterRof;
		this.rofTimer = Math.min(this.rofTimer, characterRof);
	};

	Character.prototype.skillModifier = function (skill, level) {
		var diff = this.skills[skill] - level;
		switch (true) {
			case diff <= 0:
				return 1 + 0.15 * diff;
			case diff > 0: 
				return 1 + 0.025 * (diff + 1);
		}
	};
});


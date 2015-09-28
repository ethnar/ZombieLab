'use strict';

angular.module('ZombieLabApp')

.service('equipmentService', function () {
	var service = this;

	service.items = [];
	service.weapons = [];

	service.registerItem = function (item) {
		item.price = item.price || 0;
		item.size = item.size || 'small';
		item.isLarge = item.isLarge || false;
		service.items.push(item);
	};

	service.registerWeapons = function (weapons) {
		_.each(weapons, function (item) {
			item.category = 'weapon';
			service.registerItem(item);
			service.weapons.push(item);
		});
	};

	service.newWeapon = function (weapon) {
		return {
			model: weapon,
			ammo: weapon.clipSize
		};
	};

	service.init = function () {
		service.registerWeapons([{
			name: 'M4',
			weaponClass: 'rifle',
			isLarge: true,
			dmgMin: 3,
			dmgMax: 5,
			clipSize: 30,
			rof: 400 // miliseconds
		}, {
			name: 'M1911',
			weaponClass: 'handgun',
			dmgMin: 2,
			dmgMax: 4,
			clipSize: 7,
			rof: 1100
		}]);
	}
	
	service.init();
});

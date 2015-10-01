'use strict';

angular.module('ZombieLabApp')

.run(function (equipmentService, mapService, gameService, enemyService) {
	equipmentService.registerItems({
		weapon: [
			{
				name: 'M4',
				weaponClass: 'rifle',
				isLarge: true,
				dmgMin: 3,
				dmgMax: 5,
				clipSize: 30,
				rof: 400, // miliseconds
				reload: 3000 // miliseconds
			}, {
				name: 'M1911',
				weaponClass: 'handgun',
				dmgMin: 3,
				dmgMax: 5,
				clipSize: 7,
				rof: 1100,
				reload: 2600
			}, {
				name: 'L131A1',
				weaponClass: 'handgun',
				dmgMin: 2,
				dmgMax: 4,
				clipSize: 17,
				rof: 900,
				reload: 2600
			}, {
				name: 'M608',
				weaponClass: 'handgun',
				dmgMin: 5,
				dmgMax: 9,
				clipSize: 6,
				rof: 1200,
				reload: 4000
			}
		],
		consumable: [
			{
				name: 'medkit',
				isLarge: true,
				charges: 5,
				target: 'character',
				use: function (character, target) {
					console.log('Healing!');
					console.log(target);
				}
			}, {
				name: 'bandage',
				isLarge: false,
				charges: 3,
				target: 'character',
				use: function (character, target) {
					console.log('Healing!');
					console.log(target);
				}
			}, {
				name: 'grenade',
				isLarge: false,
				charges: 3,
				target: 'area',
				use: function (item, character, direction) {
					if (mapService.isOpen(direction)) {
						var targetTile = mapService.getNextAreaForTeam(direction);
						_.each(targetTile.enemies, function (enemy) {
							enemyService.damage(enemy, _.random(4, 15));
						});
						if (!(--item.charges)) {
							gameService.destroySelectedItem();
						}
					} else {
						console.error('You must accessible room');
					}
				}
			}, {
				name: 'c4',
				isLarge: true,
				charges: 2,
				target: 'door',
				use: function (character, target) {
					console.log('Blowing!');
					console.log(target);
				}
			}, {
				name: 'terminal',
				isLarge: true,
				charges: 6,
				target: 'door',
				use: function (character, target) {
					console.log('Hacking!');
					console.log(target);
				}
			}
		]
	});
});

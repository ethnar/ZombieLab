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
				actionTime: 6,
				useChargeAtStart: true,
				use: function (itemSlot, character, target) {
					var finalHeal = 10 * character.skillModifier('firstAid', 3);
					target.health = Math.min(target.health + finalHeal, character.maxHealth);
				},
				progress: function (itemSlot, character, target, delta) {
					var progressHeal = 60 * character.skillModifier('firstAid', 3);
					target.health = Math.min(target.health + progressHeal * delta / 100, character.maxHealth);
					return true;
				}
			}, {
				name: 'bandage',
				isLarge: false,
				charges: 3,
				target: 'character',
				actionTime: 2,
				useChargeAtStart: true,
				use: function (itemSlot, character, target) {
					var finalHeal = 10 * character.skillModifier('firstAid', 2);
					target.health = Math.min(target.health + finalHeal, character.maxHealth);
				},
				progress: function (itemSlot, character, target, delta) {
					var progressHeal = 20 * character.skillModifier('firstAid', 2);
					target.health = Math.min(target.health + progressHeal * delta / 100, character.maxHealth);
					return true;
				}
			}, {
				name: 'grenade',
				isLarge: false,
				charges: 3,
				target: 'area',
				actionTime: 0.3,
				use: function (itemSlot, character, direction) {
					var targetTile = mapService.getNextAreaForTeam(direction);
					_.each(targetTile.enemies, function (enemy) {
						enemyService.damage(enemy, _.random(4, 15) * character.skillModifier('explosives', 2));
					});
				},
				progress: function (itemSlot, character, direction, delta) {
					var isOpen = mapService.isOpen(direction);
					if (!isOpen) {
						ZombieLab.error('You must target accessible room');
					}
					return isOpen;
				}
			}, {
				name: 'c4',
				isLarge: true,
				charges: 2,
				target: 'area',
				actionTime: 3,
				use: function (itemSlot, character, direction) {
					var targetTile = mapService.getNextAreaForTeam(direction);
					var path = mapService.getDirectionPathForTeam(direction);
					mapService.openDoor(path);
					_.each(targetTile.enemies, function (enemy) {
						enemyService.damage(enemy, _.random(2, 30) * character.skillModifier('explosives', 4));
					});
				},
				progress: function (itemSlot, character, direction, delta) {
					var isDoor = mapService.isDoor(direction);
					if (!isDoor) {
						ZombieLab.error('You must target closed door');
					}
					return isDoor;
				}
			}, {
				name: 'terminal',
				isLarge: true,
				charges: 6,
				target: 'area',
				use: function (itemSlot, character, direction) {
					var targetTile = mapService.getNextAreaForTeam(direction);
					var path = mapService.getDirectionPathForTeam(direction);
					mapService.openDoor(path);
				},
				progress: function (itemSlot, character, direction, delta) {
					var path = mapService.getDirectionPathForTeam(direction);
					if (!mapService.isDoor(direction) || !path.security) {
						ZombieLab.error('You must target closed, secured door');
						return false;
					}
					return Math.pow(path.security, 2) / Math.pow(character.skillModifier('hacking', 4), 2);
				}
			}
		]
	});
});

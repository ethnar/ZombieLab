'use strict';

angular.module('ZombieLabApp')

.run(function (equipmentService, mapService, gameService, enemyService) {
	equipmentService.registerItems({
		weapon: [
			{
				name: 'M4',
				weaponClass: 'rifle',
				description: 'Standard-issue mulitary assault rifle. Quick, easy to handle and deadly.',
				isLarge: true,
				dmgMin: 3,
				dmgMax: 5,
				clipSize: 30,
				skill: 'weapons',
				skillRequired: 2,
				baseChanceToHit: 85,
				range: 2,
				rof: 400, // miliseconds
				reload: 3000 // miliseconds
			}, {
				name: 'M1911',
				description: 'Old but reliable, this handgun is easy to handle and packs a fir punch.',
				weaponClass: 'handgun',
				dmgMin: 3,
				dmgMax: 5,
				clipSize: 7,
				skill: 'weapons',
				skillRequired: 1,
				baseChanceToHit: 80,
				range: 1,
				rof: 1100,
				reload: 2600
			}, {
				name: 'L131A1',
				description: 'A handy self-defence tool, this rapid-fire handgun is extremly easy to handle. Missing out on some accuracy, you may want to mind the bullets.',
				weaponClass: 'handgun',
				dmgMin: 2,
				dmgMax: 4,
				clipSize: 17,
				skill: 'weapons',
				skillRequired: 0,
				baseChanceToHit: 70,
				range: 1,
				rof: 800,
				reload: 2600
			}, {
				name: 'M608',
				description: 'A portable hand-cannon, sure to clear any opposition quickly. Mind the recoil, takes some practice to use it without breaking your joints.',
				weaponClass: 'handgun',
				dmgMin: 5,
				dmgMax: 9,
				clipSize: 6,
				skill: 'weapons',
				skillRequired: 3,
				baseChanceToHit: 80,
				range: 1,
				rof: 1200,
				reload: 4000
			}
		],
		consumable: [
			{
				name: 'Medkit',
				description: 'Stuffed with all kinds of medical wonders, this package is sure to get anyone back on their feet quickly.',
				isLarge: true,
				charges: 5,
				target: 'character',
				actionTime: 6,
				useChargeAtStart: true,
				skill: 'firstAid',
				skillRequired: 3,
				use: function (itemSlot, character, target) {
					var finalHeal = 10 * character.skillModifier(this.skill, this.skillRequired);
					target.health = Math.min(target.health + finalHeal, character.maxHealth);
				},
				progress: function (itemSlot, character, target, delta) {
					var progressHeal = 60 * character.skillModifier(this.skill, this.skillRequired);
					target.health = Math.min(target.health + progressHeal * delta / 100, character.maxHealth);
					return true;
				}
			}, {
				name: 'Bandage',
				description: 'Standard-issue all-purpose tactical banage. Plaster enough of it and your teammates might just be able to make it.',
				isLarge: false,
				charges: 3,
				target: 'character',
				actionTime: 2,
				useChargeAtStart: true,
				skill: 'firstAid',
				skillRequired: 2,
				use: function (itemSlot, character, target) {
					var finalHeal = 10 * character.skillModifier(this.skill, this.skillRequired);
					target.health = Math.min(target.health + finalHeal, character.maxHealth);
				},
				progress: function (itemSlot, character, target, delta) {
					var progressHeal = 20 * character.skillModifier(this.skill, this.skillRequired);
					target.health = Math.min(target.health + progressHeal * delta / 100, character.maxHealth);
					return true;
				}
			}, {
				name: 'Grenade',
				description: 'When you need to clear out a crowded room quickly, these will come in very handy.',
				isLarge: false,
				charges: 3,
				target: 'area',
				actionTime: 0.3,
				skill: 'explosives',
				skillRequired: 2,
				use: function (itemSlot, character, direction) {
					console.log(this);
					var targetTile = mapService.getNextAreaForTeam(direction);
					_.each(targetTile.enemies, function (enemy) {
						enemyService.damage(enemy, _.random(4, 15) * character.skillModifier(this.skill, this.skillRequired));
					});
					mapService.addAnimation(targetTile, 'explosion', 1500);
				},
				progress: function (itemSlot, character, direction, delta) {
					var isOpen = mapService.isOpen(direction);
					if (!isOpen) {
						ZombieLab.error('You must target accessible room');
					}
					return isOpen;
				}
			}, {
				name: 'C4',
				description: 'This small satchel charge will help you get through any door real quick, hurting anything that\'s unfortunate enoguh to be on the other side.',
				isLarge: true,
				charges: 2,
				target: 'area',
				actionTime: 3,
				skill: 'explosives',
				skillRequired: 4,
				use: function (itemSlot, character, direction) {
					var targetTile = mapService.getNextAreaForTeam(direction);
					var path = mapService.getDirectionPathForTeam(direction);
					mapService.openDoor(path);
					_.each(targetTile.enemies, function (enemy) {
						enemyService.damage(enemy, _.random(2, 30) * character.skillModifier(this.skill, this.skillRequired));
					});
					mapService.addAnimation(targetTile, 'explosion', 1500);
				},
				progress: function (itemSlot, character, direction, delta) {
					var isDoor = mapService.isDoor(direction);
					if (!isDoor) {
						ZombieLab.error('You must target closed door');
					}
					return isDoor;
				}
			}, {
				name: 'Terminal',
				description: 'Hacker\'s best friend, invaluable when moving through enforced security areas.',
				isLarge: true,
				charges: 6,
				target: 'area',
				skill: 'hacking',
				skillRequired: 4,
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
					return Math.pow(path.security, 2) / Math.pow(character.skillModifier(this.skill, this.skillRequired), 2);
				}
			}
		]
	});
});

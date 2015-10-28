'use strict';

angular.module('ZombieLabApp')

.run(function (equipmentService, mapService, gameService, enemyService, eventService) {
	equipmentService.registerItems({
		weapons: [
			{
				name: 'M4',
				ammoType: 'rifle',
				description: 'Standard-issue military assault rifle. Quick, easy to handle and deadly.',
				sound: 'RATA!',
				gameDifficulty: 400,
				isLarge: true,
				dmgMin: 3,
				dmgMax: 5,
				clipSize: 30,
				skill: 'weapons',
				skillRequired: 2,
				baseChanceToHit: 85,
				range: 1,
				rof: 500, // miliseconds
				reload: 2600, // miliseconds
				startingAmmo: {rifle: 60}
			}, {
				name: 'M1911',
				description: 'Old but reliable, this handgun is easy to handle and packs a fine punch.',
				ammoType: 'handgun',
				sound: 'BANG!',
				gameDifficulty: 130,
				dmgMin: 3,
				dmgMax: 5,
				clipSize: 7,
				skill: 'weapons',
				skillRequired: 1,
				baseChanceToHit: 80,
				range: 1,
				rof: 1100,
				reload: 2600,
				startingAmmo: {handgun: 40}
			}, {
				name: 'L131A1',
				description: 'A handy self-defense tool, this rapid-fire handgun is extremly easy to handle. Lacking some accuracy, you should mind the bullets.',
				ammoType: 'handgun',
				sound: 'POW!',
				gameDifficulty: 100,
				dmgMin: 2,
				dmgMax: 4,
				clipSize: 17,
				skill: 'weapons',
				skillRequired: 0,
				baseChanceToHit: 70,
				range: 1,
				rof: 800,
				reload: 2600,
				startingAmmo: {handgun: 60}
			}, {
				name: 'M608',
				description: 'A portable hand-cannon, sure to clear any opposition quickly. Mind the recoil - it takes some practice to use it without breaking your joints.',
				ammoType: 'handgun',
				sound: 'BANG!',
				gameDifficulty: 500,
				isLarge: true,
				dmgMin: 4,
				dmgMax: 7,
				clipSize: 6,
				skill: 'weapons',
				skillRequired: 3,
				baseChanceToHit: 80,
				range: 1,
				rof: 1200,
				reload: 6000,
				startingAmmo: {handgun: 35}
			}, {
				name: 'AK47',
				description: 'Old, but reliable assault rifle.',
				ammoType: 'rifle',
				sound: 'RATA!',
				gameDifficulty: 140,
				isLarge: true,
				dmgMin: 2,
				dmgMax: 4,
				clipSize: 30,
				skill: 'weapons',
				skillRequired: 2,
				baseChanceToHit: 80,
				range: 1,
				rof: 600,
				reload: 3000,
				startingAmmo: {rifle: 60}
			}, {
				name: 'G36C',
				description: 'Precise equipment favored among soldier and operatives alike.',
				ammoType: 'rifle',
				sound: 'TRRR!',
				gameDifficulty: 300,
				isLarge: true,
				dmgMin: 3,
				dmgMax: 4,
				clipSize: 30,
				skill: 'weapons',
				skillRequired: 4,
				baseChanceToHit: 93,
				range: 1,
				rof: 600,
				reload: 3000,
				startingAmmo: {rifle: 60}
			}, {
				name: 'M3A1',
				description: 'Full-auto shotgun that\'ll quite literally sweep enemies off their feet.',
				ammoType: 'shotgun',
				sound: 'BOOM!',
				gameDifficulty: 500,
				isLarge: true,
				dmgMin: 2,
				dmgMax: 10,
				clipSize: 10,
				skill: 'weapons',
				skillRequired: 5,
				baseChanceToHit: 98,
				range: 1,
				rof: 600,
				reload: 3400,
				startingAmmo: {shotgun: 40}
			}, {
				name: 'M249',
				description: 'A standard light support weapon - usage of which often limits to the pray & spray tactics.',
				ammoType: 'rifle',
				sound: 'RATATA!',
				gameDifficulty: 500,
				isLarge: true,
				dmgMin: 4,
				dmgMax: 5,
				clipSize: 200,
				skill: 'weapons',
				skillRequired: 3,
				baseChanceToHit: 75,
				range: 1,
				rof: 300,
				reload: 4000,
				startingAmmo: {rifle: 100}
			}, {
				name: 'M4510',
				description: 'An unorthodox combination of a personal defense weapon and a shotgun - in a nice, compact package.',
				ammoType: 'shotgun',
				sound: 'BANG!',
				gameDifficulty: 220,
				isLarge: false,
				dmgMin: 2,
				dmgMax: 6,
				clipSize: 5,
				skill: 'weapons',
				skillRequired: 1,
				baseChanceToHit: 95,
				range: 1,
				rof: 1200,
				reload: 7000,
				startingAmmo: {shotgun: 25}
			}, {
				name: 'MP5',
				description: 'Be-all and end-all for small caliber firearm - fully automatic, precise and deadly.',
				ammoType: 'handgun',
				sound: 'POW!',
				gameDifficulty: 600,
				isLarge: true,
				dmgMin: 3,
				dmgMax: 6,
				clipSize: 30,
				skill: 'weapons',
				skillRequired: 4,
				baseChanceToHit: 85,
				range: 1,
				rof: 400,
				reload: 3000,
				startingAmmo: {handgun: 60}
			}, {
				name: 'SPAS12',
				description: 'It\'s a shotgun, it\'s semi-auto, it doesn\'t get any simpler than that.',
				ammoType: 'shotgun',
				sound: 'BANG!',
				gameDifficulty: 270,
				isLarge: true,
				dmgMin: 1,
				dmgMax: 8,
				clipSize: 8,
				skill: 'weapons',
				skillRequired: 1,
				baseChanceToHit: 96,
				range: 1,
				rof: 1200,
				reload: 4500,
				startingAmmo: {shotgun: 48}
			}, {
				name: 'SW1905',
				description: 'Low-caliber self-defense weapon. Emergency only.',
				ammoType: 'handgun',
				sound: 'PEW!',
				gameDifficulty: 80,
				isLarge: false,
				dmgMin: 1,
				dmgMax: 3,
				clipSize: 6,
				skill: 'weapons',
				skillRequired: 1,
				baseChanceToHit: 80,
				range: 1,
				rof: 1100,
				reload: 4800,
				startingAmmo: {handgun: 40}
			}, {
				name: 'W1897',
				description: 'An old-timer\'s first choice. This weapon is as practical as it is stylish.',
				ammoType: 'shotgun',
				sound: 'BANG!',
				gameDifficulty: 180,
				isLarge: true,
				dmgMin: 1,
				dmgMax: 6,
				clipSize: 5,
				skill: 'weapons',
				skillRequired: 2,
				baseChanceToHit: 93,
				range: 1,
				rof: 1100,
				reload: 4000,
				startingAmmo: {shotgun: 45}
			}, {
				name: 'Machete',
				description: 'Slice & dice.',
				sound: 'SLASH!',
				ammoType: '',
				gameDifficulty: 150,
				isLarge: true,
				dmgMin: 2,
				dmgMax: 5,
				clipSize: 0,
				skill: 'weapons',
				skillRequired: 3,
				baseChanceToHit: 90,
				range: 0,
				rof: 1400
			}, {
				name: 'Knife',
				description: 'When you\'re all out of bullets and there are still zombies to kill.',
				sound: 'STAB!',
				ammoType: '',
				gameDifficulty: 100,
				isLarge: false,
				dmgMin: 2,
				dmgMax: 3,
				clipSize: 0,
				skill: 'weapons',
				skillRequired: 3,
				baseChanceToHit: 90,
				range: 0,
				rof: 900
			}, {
				name: 'Katana',
				description: 'Killing zombies with style.',
				sound: 'SWOOSH!',
				ammoType: '',
				gameDifficulty: 400,
				isLarge: true,
				dmgMin: 5,
				dmgMax: 8,
				clipSize: 0,
				skill: 'weapons',
				skillRequired: 5,
				baseChanceToHit: 95,
				range: 0,
				rof: 1200
			}, {
				name: 'Chainsaw',
				description: 'Dash through the zombies leaving only pieces. Do mind the tank thou.',
				sound: 'BRRRRR!',
				ammoType: '',
				gameDifficulty: 200,
				isLarge: true,
				dmgMin: 6,
				dmgMax: 8,
				clipSize: 100,
				skill: 'weapons',
				skillRequired: 2,
				baseChanceToHit: 95,
				range: 0,
				rof: 100
			}
		],
		medications: [
			{
				name: 'Medkit',
				description: 'Stuffed with all kinds of medical wonders, this package is sure to get anyone back on their feet quickly.',
				minDifficulty: 150,
				isLarge: true,
				charges: 2,
				target: 'character',
				actionTime: 6,
				useChargeAtStart: true,
				skill: 'firstAid',
				skillRequired: 3,
				value: 1,
				use: function (itemSlot, character, target) {
					var self = this;
					var finalHeal = 10 * character.skillModifier(self.skill, self.skillRequired);
					target.health = Math.min(target.health + finalHeal, character.maxHealth);
				},
				progress: function (itemSlot, character, target, delta) {
					var self = this;
					var progressHeal = 50 * character.skillModifier(self.skill, self.skillRequired);
					target.health = Math.min(target.health + progressHeal * delta / 100, character.maxHealth);
					return true;
				}
			}, {
				name: 'Bandage',
				description: 'Standard-issue all-purpose tactical banage. Plaster enough of it and your teammates might just be able to make it.',
				minDifficulty: 70,
				isLarge: false,
				charges: 3,
				target: 'character',
				actionTime: 2,
				useChargeAtStart: true,
				skill: 'firstAid',
				skillRequired: 2,
				value: 0.3,
				use: function (itemSlot, character, target) {
					var self = this;
					var finalHeal = 5 * character.skillModifier(self.skill, self.skillRequired);
					target.health = Math.min(target.health + finalHeal, character.maxHealth);
				},
				progress: function (itemSlot, character, target, delta) {
					var self = this;
					var progressHeal = 20 * character.skillModifier(self.skill, self.skillRequired);
					target.health = Math.min(target.health + progressHeal * delta / 100, character.maxHealth);
					return true;
				}
			}
		], 
		explosives: [
			{
				name: 'Grenade',
				description: 'When you need to clear out a crowded room quickly, these will come in very handy.',
				minDifficulty: 150,
				isLarge: false,
				charges: 2,
				target: 'area',
				actionTime: 0.3,
				skill: 'explosives',
				skillRequired: 2,
				value: 0.6,
				use: function (itemSlot, character, direction) {
					var self = this;
					var targetTile = mapService.getNextAreaForTeam(direction);
					_.each(targetTile.enemies, function (enemy) {
						enemyService.damage(enemy, _.random(4, 15) * character.skillModifier(self.skill, self.skillRequired));
					});
					mapService.addAnimation(targetTile, 'explosion', 1500);
				},
				progress: function (itemSlot, character, direction, delta) {
					var self = this;
					if (!mapService.isOpen(direction)) {
						ZombieLab.error('You must target accessible room');
						return false;
					}
					return true;
				}
			}, {
				name: 'C4',
				description: 'This small satchel charge will help you get through any door real quick, hurting anyone that\'s unfortunate enough to be on the other side.',
				minDifficulty: 300,
				isLarge: true,
				charges: 2,
				target: 'area',
				actionTime: 3,
				skill: 'explosives',
				skillRequired: 4,
				value: 1,
				use: function (itemSlot, character, direction) {
					var self = this;
					var targetTile = mapService.getNextAreaForTeam(direction);
					var path = mapService.getDirectionPathForTeam(direction);
					mapService.openDoor(path);
					_.each(targetTile.enemies, function (enemy) {
						enemyService.damage(enemy, _.random(2, 30) * character.skillModifier(self.skill, self.skillRequired));
					});
					mapService.addAnimation(targetTile, 'explosion', 1500);
				},
				progress: function (itemSlot, character, direction, delta) {
					var self = this;
					var isDoor = mapService.isDoor(direction);
					if (!isDoor) {
						ZombieLab.error('You must target closed door');
					}
					return isDoor;
				}
			}
		], 
		hacking: [
			{
				name: 'Terminal',
				description: 'Hacker\'s best friend, invaluable when moving through secured areas.',
				minDifficulty: 100,
				isLarge: true,
				charges: 6,
				target: 'area',
				skill: 'hacking',
				skillRequired: 4,
				value: 1,
				use: function (itemSlot, character, direction) {
					var self = this;
					var targetTile = mapService.getNextAreaForTeam(direction);
					var path = mapService.getDirectionPathForTeam(direction);
					mapService.openDoor(path);
				},
				progress: function (itemSlot, character, direction, delta) {
					var self = this;
					var path = mapService.getDirectionPathForTeam(direction);
					if (!mapService.isDoor(direction) || !path.closed || !path.security) {
						ZombieLab.error('You must target closed, secured door');
						return false;
					}
					return Math.pow(path.security, 2) / Math.pow(character.skillModifier(self.skill, self.skillRequired), 2);
				}
			}
		],
		misc: [
			{
				name: 'Barricade',
				description: 'Strudy barricade that can be used to block an open doorway.',
				minDifficulty: 250,
				isLarge: true,
				charges: 2,
				target: 'area',
				skill: 'explosives',
				skillRequired: 0,
				actionTime: 3,
				value: 0.5,
				use: function (itemSlot, character, direction) {
					var self = this;
					var targetTile = mapService.getNextAreaForTeam(direction);
					var path = mapService.getDirectionPathForTeam(direction);
					mapService.closeDoor(path, 1);
				},
				progress: function (itemSlot, character, direction, delta) {
					var self = this;
					var path = mapService.getDirectionPathForTeam(direction);
					if (!mapService.isDoor(direction) || path.closed) {
						ZombieLab.error('You must target opened door');
						return false;
					}
					return true;
				}
			}, {
				name: 'Flashlight',
				description: 'Helps you get through a dark room.',
				minDifficulty: 100,
				isLarge: false,
				target: 'area',
				actionTime: 0.1,
				value: 1,
				use: function (itemSlot, character, direction) {
					var self = this;
					var targetTile = mapService.getNextAreaForTeam(direction);
					var item = itemSlot.item;
					var turnFlashlightOff = function () {
						var element = mapService.getTileElement(item.targetedTile);
						element.removeClass('flashlight-light');
						item.targetedTile.turnLight(false);
						item.targetedTile = null;
						eventService.unbind(item.bind);
					}
					var turnFlashlightOn = function () {
						var element = mapService.getTileElement(item.targetedTile);
						element.addClass('flashlight-light');
						item.targetedTile.turnLight(true);
	
						item.bind = eventService.on.teamMove(function () {
							var deltaX = Math.abs(item.targetedTile.x - mapService.teamLocation.x);
							var deltaY = Math.abs(item.targetedTile.y - mapService.teamLocation.y);
							if (deltaX > 1 || deltaY > 1 || (deltaX != 0 && deltaY != 0)) {
								turnFlashlightOff();
							}
						});
					}

					if (item.targetedTile) {
						turnFlashlightOff();
					}
					item.targetedTile = targetTile;
					turnFlashlightOn();
				},
				progress: function (itemSlot, character, direction, delta) {
					var self = this;
					var targetTile = mapService.getNextAreaForTeam(direction);
					if ((direction && !mapService.isOpen(direction)) || targetTile.light) {
						ZombieLab.error('You must target accessible, dark room');
						return false;
					}
					return true;
				}
			}, {
				name: 'Blue Access Card',
				description: 'Single-use access card that lets you pass through standard-security doors.',
				minDifficulty: 100,
				isLarge: false,
				charges: 3,
				target: 'area',
				actionTime: 0.2,
				value: 0.3,
				use: function (itemSlot, character, direction) {
					var self = this;
					var targetTile = mapService.getNextAreaForTeam(direction);
					var path = mapService.getDirectionPathForTeam(direction);
					mapService.openDoor(path);
				},
				progress: function (itemSlot, character, direction, delta) {
					var self = this;
					var isDoor = mapService.isDoor(direction);
					var path = mapService.getDirectionPathForTeam(direction);
					if (!isDoor || path.security !== 1) {
						ZombieLab.error('You must target closed, standard-security doors');
						return false;
					}
					return true;
				}
			}, {
				name: 'Yellow Access Card',
				description: 'Single-use access card that lets you pass through heightened-security doors.',
				minDifficulty: 100,
				isLarge: false,
				charges: 2,
				target: 'area',
				actionTime: 0.2,
				value: 0.7,
				use: function (itemSlot, character, direction) {
					var self = this;
					var targetTile = mapService.getNextAreaForTeam(direction);
					var path = mapService.getDirectionPathForTeam(direction);
					mapService.openDoor(path);
				},
				progress: function (itemSlot, character, direction, delta) {
					var self = this;
					var isDoor = mapService.isDoor(direction);
					var path = mapService.getDirectionPathForTeam(direction);
					if (!isDoor || path.security !== 2) {
						ZombieLab.error('You must target closed, heightened-security doors');
						return false;
					}
					return true;
				}
			}, {
				name: 'Red Access Card',
				description: 'Single-use access card that lets you pass through high-security doors.',
				minDifficulty: 100,
				isLarge: false,
				charges: 1,
				target: 'area',
				actionTime: 0.2,
				value: 1.2,
				use: function (itemSlot, character, direction) {
					var self = this;
					var targetTile = mapService.getNextAreaForTeam(direction);
					var path = mapService.getDirectionPathForTeam(direction);
					mapService.openDoor(path);
				},
				progress: function (itemSlot, character, direction, delta) {
					var self = this;
					var isDoor = mapService.isDoor(direction);
					var path = mapService.getDirectionPathForTeam(direction);
					if (!isDoor || path.security !== 3) {
						ZombieLab.error('You must target closed, high-security doors');
						return false;
					}
					return true;
				}
			}
		],
		ammo: [
			{
				name: 'Rifle ammo',
				image: 'rifle',
				value: 0.8,
				ammoType: 'rifle',
				description: 'Ammunition for rifles.',
				immediateUse: true,
				use: function (itemSlot) {
					equipmentService.addAmmo(this.ammoType, itemSlot.item.quantity);
					itemSlot.item = null;
				}
			}, {
				name: 'Shotgun ammo',
				image: 'shotgun',
				value: 1,
				ammoType: 'shotgun',
				description: 'Ammunition for shotguns.',
				immediateUse: true,
				use: function (itemSlot) {
					equipmentService.addAmmo(this.ammoType, itemSlot.item.quantity);
					itemSlot.item = null;
				}
			}, {
				name: 'Handgun ammo',
				image: 'handgun',
				value: 1,
				ammoType: 'handgun',
				description: 'Ammunition for handguns.',
				immediateUse: true,
				use: function (itemSlot) {
					equipmentService.addAmmo(this.ammoType, itemSlot.item.quantity);
					itemSlot.item = null;
				}

			}
		]
	});
});

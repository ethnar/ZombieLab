'use strict';

angular.module('ZombieLabApp')

.service('characterService', function (equipmentService, gameService, mapService) {
	var service = this;

	service.rosterSize = 6;
	service.roster = [];
	service.team = [];
	service.maxSkill = 5;

	service.createNewCharacter = function (archetype) {
		var budget = _.random(80, 100);
		var disposition = {
			weapon: 10,
			equipment: 10,
			skills: 10
		};
		var itemSmall = null;
		var itemLarge = null;
		var skills = {
			weapons: 0,
			hacking: 0,
			explosives: 0,
			firstAid: 0
		};
		while (budget > 0) {
			var attribute = _.sample(_.keys(disposition));
			var value = _.random(3, 10);
			value = Math.min(value, budget);

			disposition[attribute] += value;
			budget -= value;
		}
		// *** select weapon ***
		var pickedWeapon = {
			cost: 0
		};
		_.each(archetype.weapon, function (weaponName, required) {
			if (disposition.weapon >= required) {
				pickedWeapon = {
					name: weaponName,
					cost: required
				};
			}
		});
		disposition.weapon -= pickedWeapon.cost;
		// *** select equipment ***
		_.each(archetype.equipment, function (itemName, cost) {
			if (disposition.equipment >= cost) {
				var item = equipmentService.newItemByName(itemName);
				if (!itemLarge || (!item.model.isLarge && !itemSmall)) {
					disposition.equipment -= cost;
					if (item.model.isLarge || itemSmall) {
						itemLarge = item;
					} else {
						itemSmall = item;
					}
				}
			}
		});
		// ** dump remaining points in skills
		disposition.skills += disposition.weapon + disposition.equipment;
		// *** assign skills ***
		while (disposition.skills >= 10) {
			var random = _.random(1, 100);
			var increasedSkill = null;
			_.each(archetype.skills, function (treshold, skill) {
				random -= treshold;
				if (random <= 0 && !increasedSkill) {
					increasedSkill = skill;
				}
			});
			if (skills[increasedSkill] < service.maxSkill) {
				skills[increasedSkill]++;
				disposition.skills -= 10;
			}
		}
		// *** create character ***
		return new Character({
			name: gameService.getNewName(),
			weapon: pickedWeapon.name ? new ItemSlot(equipmentService.newItemByName(pickedWeapon.name)) : new ItemSlot(),
			itemSmall: new ItemSlot(itemSmall),
			itemLarge: new ItemSlot(itemLarge),
			rofTimer: 0,
			reloadingTimer: 0,
			reloadingWeapon: null,
			health: 100,
			maxHealth: 100,
			conscious: true,
			alive: true,
			active: true,
			skills: skills,
			bestSkills: []
		});
	};

	service.buildNewRoster = function () {
		service.roster = [];
		var selectedArchetypes = [];
		_.each(service.archetypes, function (definition, name) {
			selectedArchetypes.push(name);
			selectedArchetypes.push(name);
		});
		while (selectedArchetypes.length > service.rosterSize) {
			var idx = _.random(0, selectedArchetypes.length - 1);
			selectedArchetypes.splice(idx, 1);
		}
		_.each(selectedArchetypes, function (archetypeName) {
			var character = service.createNewCharacter(service.archetypes[archetypeName]);
			service.roster.push(character);
		});
	};

	service.wipeTeam = function () {
		service.team = [];
	};

	service.addToTeam = function (character) {
		service.team.push(character);
		_.each(['weapon', 'itemSmall', 'itemLarge'], function (slotName) {
			if (character[slotName].item && character[slotName].item.model.startingAmmo) {
				_.each(character[slotName].item.model.startingAmmo, function (qty, type) {
					equipmentService.ammo[type] = equipmentService.ammo[type] || 0;
					equipmentService.ammo[type] += qty;
				});
			}
		});
		service.recalculateBestSkills();
	};

	service.getAliveMembers = function () {
		return _.filter(service.team,  function (character) {
			return character.alive;
		});
	};

	service.recalculateBestSkills = function () {
		var skills = {
			weapons: {
				characters: [],
				value: 0
			},
			hacking: {
				characters: [],
				value: 0
			},
			explosives: {
				characters: [],
				value: 0
			},
			firstAid: {
				characters: [],
				value: 0
			}
		};
		_.each(service.team, function (character) {
			character.bestSkills = [];
			_.each(character.skills, function (value, skill) {
				if (value == skills[skill].value) {
					skills[skill].characters.push(character);
				}
				if (value > skills[skill].value) {
					skills[skill] = {
						value: value,
						characters: [character]
					}
				}
			});
		});
		_.each(skills, function (info, skill) {
			_.each(info.characters, function (character) {
				character.bestSkills.push(skill);
			});
		});
	};

	service.useItem = function (character, item, size) {
		if (item.isWeapon() && size === 'weapon') {
			service.startReloading(character);
		}
	};

	service.startReloading = function (character) {
		var ammoType = character.weapon.item.model.ammoType;
		if (character.weapon.item.model.clipSize > character.weapon.item.ammo && equipmentService.ammo[ammoType] > 0) {
			character.reloadingTimer = character.weapon.item.model.reload / character.skillModifier('weapons', character.weapon.item.model.skillRequired);
			character.reloadingWeapon = character.weapon.item;
		}
	};

	service.reloading = function (character, delta) {
		var ammoType = character.weapon.item.model.ammoType;
		if ((character.reloadingWeapon && character.reloadingWeapon !== character.weapon.item) || equipmentService.ammo[ammoType] == 0) {
			// weapon swapped or no ammo, stop reloading
			character.reloadingWeapon = null;
			character.reloadingTimer = 0;
		} else {
			if (character.reloadingWeapon) {
				character.reloadingTimer -= delta;
				if (character.reloadingTimer <= 0) {
					var ammoAdded = Math.min(character.weapon.item.model.clipSize - character.weapon.item.ammo, equipmentService.ammo[ammoType]);
					character.weapon.item.ammo += ammoAdded;
					equipmentService.ammo[ammoType] -= ammoAdded;
				}
			} else {
				service.startReloading(character);
			}
		}
	};
});


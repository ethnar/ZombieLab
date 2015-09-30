'use strict';

angular.module('ZombieLabApp')

.service('characterService', function (equipmentService, gameService) {
	var service = this;

	service.rosterSize = 6;
	service.roster = [];
	service.team = [];
	service.maxSkill = 5;

	function Character(obj) {
		angular.extend(this, obj);
	};

	Character.prototype.isReloading = function () {
		return this.reloadingTimer > 0 && this.alive;
	};

	service.createNewCharacter = function (archetype) {
		var budget = _.random(80, 100);
		var disposition = {
			weapon: 10,
			gear: 10,
			skills: 10
		};
		var skills = {
			weapons: 0,
			hacking: 0,
			explosives: 0,
			mechanic: 0,
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
		var pickedWeaponName = null;
		_.each(archetype.weapon, function (weaponName, required) {
			if (disposition.weapon >= required) {
				pickedWeaponName = weaponName;
			}
		});
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
		// *** select gear ***

		// *** create character ***
		return new Character({
			name: gameService.getNewName(),
			weapon: pickedWeaponName ? equipmentService.newItemByName(pickedWeaponName) : null,
			itemSmall: null,
			itemLarge: null,
			rofTimer: 0,
			reloadingTimer: 0,
			health: 100,
			conscious: true,
			alive: true,
			active: true,
			skills: skills
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
	};

	service.getAliveMembers = function () {
		return _.filter(service.team,  function (character) {
			return character.alive;
		});
	};

	service.doDamage = function (character, damage) {
		character.health -= damage;
		if (character.health <= 0) {
			service.kill(character);
		}
	};

	service.kill = function (character) {
		character.alive = character.conscious = false;
		character.health = 0;
		// TODO: drop stuff on the ground
		if (service.getAliveMembers().length === 0) {
			gameService.gameOver();
		}
	};

	service.useItem = function (character, item, size) {
		if (item.model.category === 'weapon' && size === 'weapon') {
			service.startReloading(character);
		}
	};

	service.startReloading = function (character) {
		if (character.weapon.model.clipSize > character.weapon.ammo) {
			character.reloadingTimer = 4000;
		}
	};

	service.reloading = function (character, delta) {
		character.reloadingTimer -= delta;
		if (character.reloadingTimer <= 0) {
			character.weapon.ammo = character.weapon.model.clipSize;
		}
	};
});


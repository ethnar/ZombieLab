'use strict';

angular.module('ZombieLabApp')

.service('characterService', function (equipmentService, gameService, mapService) {
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

	Character.prototype.canPerformAction = function () {
		return this.conscious && this.alive;
	};

	Character.prototype.canShoot = function () {
		return this.conscious && this.active && this.alive;
	};

	Character.prototype.resetAim = function () {
		var characterRof = Math.floor(this.weapon.model.rof * Math.pow(this.skillModifier('weapons', this.weapon.model.skillRequired), 0.5));
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
		var pickedWeapon = null;
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
			weapon: pickedWeapon.name ? equipmentService.newItemByName(pickedWeapon.name) : null,
			itemSmall: itemSmall,
			itemLarge: itemLarge,
			rofTimer: 0,
			reloadingTimer: 0,
			reloadingWeapon: null,
			health: 100,
			maxHealth: 100,
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
		character.active = true;
		character.health = 0;
		_.each(['weapon', 'itemSmall', 'itemLarge'], function (slot) {
			if (character[slot]) {
				mapService.dropItem({item: character[slot]}, mapService.teamLocation);
				character[slot] = null;
			}
		});
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
			character.reloadingWeapon = character.weapon;
		}
	};

	service.reloading = function (character, delta) {
		if (character.reloadingWeapon !== character.weapon) {
			// weapon swapped, stop reloading
			character.reloadingTimer = 0;
		} else {
			character.reloadingTimer -= delta;
			if (character.reloadingTimer <= 0) {
				character.weapon.ammo = character.weapon.model.clipSize;
			}
		}
	};
});


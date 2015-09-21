'use strict';

angular.module('ZombieLabApp')

.service('characterService', function (equipmentService) {
	var service = this;

	service.names = ['Alan', 'Arthur', 'Jake', 'Jane', 'Hilda', 'Thomas', 'Natalie', 'John', 'Martha', 'Ashley']
	service.roster = [];
	service.team = [];

	service.createNewCharacter = function () {
		return {
			name: _.sample(service.names),
			weapon: equipmentService.newWeapon(_.sample(equipmentService.weapons)),
			itemSmall: null,
			itemLarge: null,
			rofTimer: 0,
			reloadingTimer: 0,
			health: 100,
			conscious: true,
			alive: true,
			active: true
		}
	};

	service.buildNewRoster = function (rosterSize) {
		service.roster = [];
		for (var i = 0; i < rosterSize; i++) {
			// TODO: make sure we get a nice, varied selection
			service.roster.push(service.createNewCharacter());
		}
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
			character.alive = character.conscious = false;
			character.health = 0;
			// TODO: drop stuff on the ground
		}
	};

	service.startReloading = function (character) {
		character.reloadingTimer = 4000;
	};

	service.reloading = function (character, delta) {
		character.reloadingTimer -= delta;
		if (character.reloadingTimer <= 0) {
			character.weapon.ammo = character.weapon.model.clipSize;
		}
	};
});


'use strict';

angular.module('ZombieLabApp')

.service('characterService', function (equipmentService, gameService) {
	var service = this;

	service.roster = [];
	service.team = [];

	function Character(obj) {
		angular.extend(this, obj);
	};

	Character.prototype.isReloading = function () {
		return this.reloadingTimer > 0 && this.alive;
	};

	service.createNewCharacter = function () {
		return new Character({
			name: gameService.getNewName(),
			weapon: null,
			itemSmall: null,
			itemLarge: null,
			rofTimer: 0,
			reloadingTimer: 0,
			health: 100,
			conscious: true,
			alive: true,
			active: true,
			skills: {
				weapons: 0,
				hacking: 0,
				explosives: 0,
				mechanic: 0,
				firstAid: 0
			}
		});
	};

	service.buildNewRoster = function (rosterSize) {
		service.roster = [];
		for (var i = 0; i < rosterSize; i++) {
			// TODO: make sure we get a nice, varied selection
			service.roster.push(service.createNewCharacter());
		}
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


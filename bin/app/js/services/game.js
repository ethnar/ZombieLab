'use strict';

angular.module('ZombieLabApp')

.service('gameService', function () {
	var service = this;
	var difficulty;
	service.isGameOver = false;
	service.selectedItemSlot = null;
	service.names = ['Alan', 'Arthur', 'Jake', 'Jane', 'Hilda', 'Thomas', 'Natalie', 'John', 'Martha', 'Ashley'];
	service.availableNames = null;
	
	service.resetGame = function () {
		difficulty = 500;
		service.availableNames = angular.copy(service.names);
		service.isGameOver = false;
	};

	service.getNewName = function () {
		var idx = _.random(0, service.availableNames.length - 1);
		var name = service.availableNames[idx];
		service.availableNames.splice(idx, 1);
		return name;
	};

	service.gameOver = function () {
		service.isGameOver = true;
	};

	service.getDifficulty = function () {
		return difficulty;
	};

	service.increaseDifficulty = function () {
		difficulty += 70;
	};

	service.isItemSelected = function () {
		return !!service.selectedItemSlot;
	};

	service.getSelectedItem = function () {
		return service.selectedItemSlot.item;
	};

	service.getSelectedItemOwner = function () {
		return service.selectedItemSlot.character;
	};

	service.deselectItem = function () {
		service.selectedItemSlot = null;
	};

	service.destroySelectedItem = function () {
		service.selectedItemSlot.item = null;
	};
});


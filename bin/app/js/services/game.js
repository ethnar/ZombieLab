'use strict';

angular.module('ZombieLabApp')

.service('gameService', function () {
	var service = this;
	var difficulty;
	service.isGameOver = false;
	service.selectedItemSlot = null;
	
	service.resetGame = function () {
		difficulty = 100;
		service.isGameOver = false;
	};

	service.gameOver = function () {
		service.isGameOver = true;
	};

	service.getDifficulty = function () {
		return difficulty;
	};

	service.increaseDifficulty = function () {
		difficulty += 100;
	};

	service.isItemSelected = function () {
		return !!service.selectedItemSlot;
	};

	service.deselectItem = function () {
		service.selectedItemSlot = null;
	};
});


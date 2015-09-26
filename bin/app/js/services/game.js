'use strict';

angular.module('ZombieLabApp')

.service('gameService', function () {
	var service = this;
	var difficulty;
	service.isGameOver = false;
	
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
});


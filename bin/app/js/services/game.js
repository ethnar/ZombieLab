'use strict';

angular.module('ZombieLabApp')

.service('gameService', function () {
	var service = this;
	var difficulty;
	service.isGameOver = false;
	
	service.resetGame = function () {
		difficulty = 500; // 100 by default
		service.isGameOver = false;
	};

	service.gameOver = function () {
		service.isGameOver = true;
	};

	service.getDifficulty = function () {
		return difficulty;
	};

	service.increaseDifficulty = function () {
		difficulty += 30;
	};
});


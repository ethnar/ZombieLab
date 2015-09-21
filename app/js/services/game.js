'use strict';

angular.module('ZombieLabApp')

.service('gameService', function () {
	var service = this;

	var difficulty;
	
	service.getDifficulty = function () {
		return difficulty;
	};

	service.resetDifficulty = function () {
		difficulty = 500; // 100 by default
	};

	service.increaseDifficulty = function () {
		difficulty += 30;
	};
});


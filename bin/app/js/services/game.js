'use strict';

angular.module('ZombieLabApp')

.service('gameService', function ($q, $timeout) {
	var service = this;
	var difficulty;
	service.isGameOver = false;
	service.selectedItemSlot = null;
	service.names = ['Alan', 'Arthur', 'Jake', 'Jane', 'Hilda', 'Thomas', 'Natalie', 'John', 'Martha', 'Ashley'];
	service.availableNames = null;
	service.gamePaused = 0;
	service.gameLoading = {
		isLoading: true,
		progress: 0
	};
	var loadingTransition = parseFloat($('.loading-overlay').css('transition').match(/[0-9]*\.?[0-9]s/)[0]);

	service.togglePause = function () {
		service.gamePaused = service.gamePaused ? 0 : 1;
	};
	service.pause = function () {
		service.gamePaused++;
	};
	service.unpause = function () {
		service.gamePaused--;
	};

	service.startLoading = function () {
		var defer = $q.defer();
		service.gameLoading.isLoading = true;
		service.gameLoading.progress = 0;

		$timeout(function () {
			defer.resolve();
		}, loadingTransition * 1000 + 100);
		return defer.promise;
	};
	service.loadingProgress = function (progress) {
		service.gameLoading.progress += progress;
	};
	service.finishLoading = function (delay) {
		$timeout(function () {
			service.gameLoading.isLoading = false;
		}, delay);
	}

	service.resetGame = function () {
		difficulty = 100;
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
		difficulty += 150;
	};

	service.isItemSelected = function () {
		return !!service.selectedItemSlot;
	};

	service.getSelectedItemSlot = function () {
		return service.selectedItemSlot;
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

	return service;
});


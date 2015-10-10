'use strict';

angular.module('ZombieLabApp')

.service('gameService', function ($q, $timeout, equipmentService) {
	var service = this;
	var difficulty;
	service.isGameOver = false;
	service.selectedItemSlot = null;
	service.names = ['Alan', 'Arthur', 'Jake', 'Jane', 'Hilda', 'Thomas', 'Natalie', 'John', 'Martha', 'Ashley'];
	service.availableNames = null;
	service.tutorialEnabled = false;
	service.gamePaused = 0;
	service.gameLoading = {
		isLoading: true
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
	service.isPaused = function () {
		return service.gamePaused > 0;
	};

	service.startLoading = function () {
		var defer = $q.defer();
		service.gameLoading.isLoading = true;

		$timeout(function () {
			defer.resolve();
		}, loadingTransition * 1000 + 100);
		return defer.promise;
	};
	service.finishLoading = function (delay) {
		var defer = $q.defer();
		$timeout(function () {
			service.gameLoading.isLoading = false;
			$timeout(function () {
				defer.resolve();
			}, loadingTransition * 1000);
		}, delay);
		return defer.promise;
	};

	service.resetGame = function () {
		difficulty = 100;
		service.availableNames = angular.copy(service.names);
		equipmentService.removeAmmo();
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
		difficulty += 40;
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


'use strict';

angular.module('ZombieLabApp')

.controller('mainMenuController', function ($scope, $location, characterService, mapService, mapGeneratorService, gameService) {
	$scope.startNewGame = function (tutorialEnabled) {
		gameService.startLoading().then(function () {
			gameService.resetGame();
			characterService.buildNewRoster();
			mapGeneratorService.createNewMap();
			$location.path('team-setup');
			gameService.finishLoading();
			gameService.tutorialEnabled = tutorialEnabled;
		});
	};

	gameService.finishLoading();
});

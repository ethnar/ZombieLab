'use strict';

angular.module('ZombieLabApp', ['ngRoute', 'angular-gestures'])

.config(function($routeProvider, $locationProvider, hammerDefaultOptsProvider) {
	$routeProvider
		.when('/main-menu', {
			templateUrl: 'partials/main-menu.html',
			controller: 'mainMenuController'
		})
		.when('/team-setup', {
			templateUrl: 'partials/team-setup.html',
			controller: 'teamSetupController'
		})
		.when('/game', {
			templateUrl: 'partials/game.html',
			controller: 'gameController'
		})
		.otherwise({
			templateUrl: 'partials/start.html',
			controller: 'startController'
		});
})

.controller('zombieLabController', function ($scope, gameService, modalService) {
	$scope.model = {
		loading: gameService.gameLoading,
		pauseScreen: false
	};

	$scope.togglePause = gameService.togglePause;

	$scope.enablePauseScreen = function (event) {
		gameService.togglePause();
		var modal = modalService.open({
			template: 'game-pause-modal.html',
			scope: $scope
		});

		modal.on('close', function () {
			gameService.unpause();
		});
		
		event.preventDefault();
	};

	document.addEventListener('deviceready', function () {
		document.addEventListener('backbutton', $scope.enablePauseScreen, false);
	}, false);
});

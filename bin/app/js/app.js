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
    hammerDefaultOptsProvider.set({
        recognizers: [[Hammer.Swipe, {
        	threshold: 1,
        	velocity: 0.01
        }]]
    });
});

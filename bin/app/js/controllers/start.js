'use strict';

angular.module('ZombieLabApp')

.controller('startController', function ($timeout, gameService) {
	gameService.finishLoading();
});

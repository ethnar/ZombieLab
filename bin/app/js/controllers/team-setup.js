'use strict';

angular.module('ZombieLabApp')

.controller('teamSetupController', function ($scope, $location, characterService, gameService) {
	$scope.model = {
		roster: characterService.roster,
		charactersSelectedCount: 0,
		targetTeamSize: 4
	};

	$scope.selectCharacter = function (character) {
		if ($scope.model.charactersSelectedCount < $scope.model.targetTeamSize || character.selected) {
			character.selected = !character.selected;
			$scope.model.charactersSelectedCount += character.selected ? +1 : -1;
		}
	};

	$scope.startGame = function () {
		characterService.wipeTeam();
		_.each(characterService.roster, function (character) {
			if (character.selected) {
				characterService.addToTeam(character);
			}
		});
		$location.path('game');
	};
});

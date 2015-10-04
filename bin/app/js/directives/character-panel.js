'use strict';

angular.module('ZombieLabApp')

.directive('characterPanel', function (characterService) {
	return {
		restrict: 'E',
		replace: true,
		templateUrl: 'partials/directives/character-panel.html',
		scope: {
			character: '=',
			readOnly: '=?',
			disableItems: '=?',
			characterClickAction: '&?'
		},
		controller: function ($scope, $element) {
			$scope.character.$element = $element;
			// $scope.killDebug = function () {
			// 	characterService.kill($scope.character);
			// }
		}
	};
});

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
			characterHoldAction: '&?',
			characterClickAction: '&?'
		},
		controller: function ($scope, $element, $attrs) {
			if ($attrs.mainFrame) {
				$scope.character.$element = $element;
			}
			// $scope.killDebug = function () {
			// 	characterService.kill($scope.character);
			// }
		}
	};
});

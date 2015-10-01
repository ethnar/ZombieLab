'use strict';

angular.module('ZombieLabApp')

.directive('characterPanel', function () {
	return {
		restrict: 'E',
		replace: true,
		templateUrl: 'partials/directives/character-panel.html',
		scope: {
			character: '=',
			readOnly: '=?',
			disableItems: '=?'
		},
		controller: function ($scope) {
		}
	};
});

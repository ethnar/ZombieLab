'use strict';

angular.module('ZombieLabApp')

.directive('skillBar', function () {
	return {
		restrict: 'E',
		replace: true,
		templateUrl: 'partials/directives/skill-bar.html',
		scope: {
			skill: '=',
			value: '='
		}
	};
})

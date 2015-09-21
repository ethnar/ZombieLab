'use strict';

angular.module('ZombieLabApp')

.directive('itemSlot', function () {
	return {
		restrict: 'E',
		replace: true,
		templateUrl: 'partials/directives/item-slot.html',
		scope: {
			item: '=',
			size: '@'
		},
		controller: function ($scope) {
		}
	};
});

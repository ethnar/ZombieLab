'use strict';

angular.module('ZombieLabApp')

.directive('itemSlot', function ($timeout, gameService) {
	return {
		restrict: 'E',
		replace: true,
		templateUrl: 'partials/directives/item-slot.html',
		scope: {
			item: '=',
			size: '@',
			allowedLarge: '@'
		},
		controller: function ($scope, $element) {
			var controller = this;

			$scope.allowedLarge = $scope.allowedLarge || false;
			$scope.model = {
				dragStart: {
					x: null,
					y: null
				}
			};

			$scope.swapItems = function () {
				var $scopeSource = gameService.selectedItemSlot;
				if ((!$scope.item || !$scope.item.model.isLarge || $scopeSource.allowedLarge) &&
					(!$scopeSource.item || !$scopeSource.item.model.isLarge || $scope.allowedLarge)) {
					var temp = $scope.item;
					$scope.item = $scopeSource.item;
					$scopeSource.item = temp;
				}
				$scope.deselectItem();
			};

			$scope.selectItem = function () {
				gameService.selectedItemSlot = $scope; // that's pretty bad, but workarounds would be worse
			};

			$scope.deselectItem = function () {
				gameService.selectedItemSlot = null;
			};

			$scope.click = function () {
				if (gameService.selectedItemSlot) {
					$scope.swapItems();
					return;
				}
				if ($scope.item) {
					$scope.selectItem();
					return;
				}
			};

			$scope.isSelected = function () {
				return gameService.selectedItemSlot === $scope;
			};
		}
	};
});

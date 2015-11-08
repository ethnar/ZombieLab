'use strict';

angular.module('ZombieLabApp')

.directive('itemSlot', function ($timeout, gameService, characterService, modalService, mapService) {
	return {
		restrict: 'E',
		replace: true,
		templateUrl: 'partials/directives/item-slot.html',
		scope: {
			itemSlot: '=',
			slotType: '@',
			character: '=',
			allowedLarge: '@',
			disabled: '='
		},
		controller: function ($scope, $element) {
			var controller = this;
			
			$scope.$watch('itemSlot', function () {
				if ($scope.itemSlot) {
					$scope.itemSlot.allowedLarge = $scope.allowedLarge || false;
					$scope.itemSlot.character = $scope.character;
					$scope.itemSlot.disabled = $scope.disabled;
					$scope.itemSlot.slotType = $scope.slotType;
				}
			});
			$scope.model = {
				dragStart: {
					x: null,
					y: null
				}
			};

			$scope.itemDroppable = function () {
				return gameService.isMainGame;
			};

			$scope.dropItem = function () {
				$scope.itemSlot.item.drop(mapService.teamLocation);
			};

			$scope.swapItems = function () {
				var sourceSlot = gameService.selectedItemSlot;
				if ((!$scope.itemSlot.item || !$scope.itemSlot.item.model.isLarge || sourceSlot.allowedLarge) &&
					(!sourceSlot.item || !sourceSlot.item.model.isLarge || $scope.itemSlot.allowedLarge)) {
					$scope.itemSlot.swapWith(sourceSlot);
				} else {
					ZombieLab.error('You can\'t swap these items');
				}
				gameService.deselectItem();
			};

			$scope.selectItem = function () {
				if ($scope.itemSlot.item.model.immediateUse) {
					$scope.itemSlot.item.model.use($scope.itemSlot); // TODO: wrong - it should be "use" on item itself
				} else {
					gameService.selectedItemSlot = $scope.itemSlot;
				}
			};

			$scope.click = function () {
				if ($scope.itemSlot.item && $scope.itemSlot !== $scope.itemSlot.item.slot) {
					console.error('THIS IS REALLY BAD!');
				}
				if ($scope.disabled || $scope.tempDisabled) {
					return;
				}
				if (gameService.selectedItemSlot) {
					if (gameService.selectedItemSlot === $scope.itemSlot) {
						if ($scope.character) {
							characterService.useItem($scope.character, $scope.itemSlot.item, $scope.slotType);
							gameService.deselectItem();
						}
					} else {
						$scope.swapItems();
					}
					return;
				}
				if ($scope.itemSlot.item) {
					$scope.selectItem();
					return;
				}
			};

			$scope.showItemInfo = function () {
				if (!$scope.itemSlot.item) {
					return;
				}
				gameService.pause();
				var modal = modalService.open({
					template: 'item-info-modal.html',
					scope: $scope
				});

				modal.on('close', function () {
					gameService.unpause();
				});
			};

			$scope.isSelected = function () {
				return $scope.itemSlot && gameService.selectedItemSlot === $scope.itemSlot;
			};
		}
	};
});

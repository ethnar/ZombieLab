'use strict';

angular.module('ZombieLabApp')

.directive('itemSlot', function () {
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

			controller.unwrapEvent = function (event) {
				if (event.originalEvent.touches && event.originalEvent.touches[0]) {
					event.clientX = event.originalEvent.touches[0].clientX;
					event.clientY = event.originalEvent.touches[0].clientY;
				}
			};

			controller.mouseUp = function (event) {
				var $scopeSource = window.zombieLab.draggedItemScope;
				if ($scopeSource) {
					if (($scope.item && $scope.item.model.isLarge && !$scopeSource.allowedLarge) ||
						($scopeSource.item && $scopeSource.item.model.isLarge && !$scope.allowedLarge)) {
						return;
					}
					var temp = $scope.item;
					$scope.item = $scopeSource.item;
					$scopeSource.item = temp;
					$scope.$apply();
				}
			};

			controller.mouseDown = function (event) {
				controller.unwrapEvent(event);
				if (!$scope.item) {
					return;
				}
				$scope.model.$item = $element.find('.item');
				var marginLeft = $scope.model.$item.find('img').css('margin-left');
				window.zombieLab.draggedItemScope = $scope;

				$scope.model.dragStart = {
					mouse: {
						x: event.clientX,
						y: event.clientY
					},
					element: {
						x: parseInt(marginLeft, 10),
						y: 0
					}
				};

				controller.attachDragEvents();
			};

			controller.mouseMove = function (event) {
				controller.unwrapEvent(event);
				$scope.model.$item
					.css('position', 'absolute')
					.css('pointer-events', 'none')
					.css('top', event.clientY - $scope.model.dragStart.mouse.y + $scope.model.dragStart.element.y)
					.css('left', event.clientX - $scope.model.dragStart.mouse.x + $scope.model.dragStart.element.x)
					.css('x-index', 500);
			};

			controller.draggingMouseUp = function (event) {
				controller.unwrapEvent(event);
				$(document).unbind('mousemove touchmove', controller.mouseMove);
				$(document).unbind('mouseup touchend touchcancel', controller.draggingMouseUp);
				window.zombieLab.draggedItemScope = null;
				$scope.model.$item
					.css('position', '')
					.css('pointer-events', '')
					.css('top', '')
					.css('left', '')
					.css('x-index', '');
			};

			controller.attachDragEvents = function () {
				$(document).on('mousemove touchmove', controller.mouseMove);
				$(document).on('mouseup touchend touchcancel', controller.draggingMouseUp);
			};

			$scope.init = function () {
				$element.on('mousedown touchstart', controller.mouseDown);
				$element.on('mouseup touchend touchcancel', controller.mouseUp);
			};

			$scope.init();
		}
	};
});

angular.module('ZombieLabApp')

.directive('ngHold', function () {
	return {
		restrict: 'A',
		controller: function ($scope, $element, $timeout, $attrs) {
			var timeout;

			$element.on('mousedown touchstart', function (event) {
				timeout = $timeout(function () {
					$scope.$eval($attrs.ngHold);
				}, 500);
			});
			$element.on('mouseup touchend touchcancel', function (event) {
				if (timeout) {
					$timeout.cancel(timeout);
					timeout = null;
				}
			});
		}
	};
});
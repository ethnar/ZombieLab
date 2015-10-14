angular.module('ZombieLabApp')

.directive('ngHold', function () {
	return {
		restrict: 'A',
		controller: function ($scope, $element, $timeout, $attrs) {
			var timeout;

			$element.on(ZombieLab.touchstart, function (event) {
				$timeout.cancel(timeout);
				timeout = $timeout(function () {
					$scope.$eval($attrs.ngHold);
				}, 500);
			});

			$element.on(ZombieLab.touchend, function (event) {
				if (timeout) {
					$timeout.cancel(timeout);
					timeout = null;
				}
			});
		}
	};
});
'use strict';

angular.module('ZombieLabApp')

.directive('gameMap', function (mapService) {
	return {
		restrict: 'E',
		replace: true,
		templateUrl: 'partials/directives/game-map.html',
		scope: {
			map: '='
		},
		controller: function ($scope) {
			$scope.getTileClass = function (tile) {
				return _.keys(_.pick(tile, function (property) {
					return property;
				})).join(' ');
			};

			$scope.getGroupedEnemies = function (enemies) {
				var aliveEnemies = _.pick(enemies, function (enemy) {
					return enemy.health > 0;
				});
				return _.countBy(aliveEnemies, function (enemy) {
					return enemy.type.name;
				});
			};

			$scope.hasItems = function (tile) {
				return tile.hasItems();
			};
		}
	};
})

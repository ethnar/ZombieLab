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
				var result = {
					area: tile.area, 
					room: tile.room, 
					visible: tile.visible, 
					revealed: tile.revealed, 
					start: tile.start, 
					finish: tile.finish, 
					light: tile.isLit()
				};
				_.each(mapService.directions, function (direction) {
					result[direction] = tile[direction];
					result[direction + '-corridor'] = tile[direction] && !tile[direction].door;
				});
				return result;
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

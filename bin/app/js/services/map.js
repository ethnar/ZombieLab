'use strict';

angular.module('ZombieLabApp')

.service('mapService', function ($timeout) {
	var directions = ['N', 'E', 'S', 'W'];
	var directionOffsets = {
		'N': [0, -1],
		'S': [0, 1],
		'E': [1, 0],
		'W': [-1, 0]
	}

	var service = this;
	service.tileSize; // Needed for the camera
	service.map = [];
	service.areas = [];
	service.mapSizeX = 14;
	service.mapSizeY = 9;
	service.startTile = null;
	service.finishTile = null;
	service.roomCount = 0;
	service.areaCount = 0;
	service.mapMargins = 2; // determines start/finish locations distance from borders
	service.teamLocation = null;
	service.validTargets = [];
	service.teamSteps = 0;

	service.getTileSize = function () {
		if (!service.tileSize) {
			service.tileSize = $('.tile').outerHeight();
		}
		return service.tileSize;
	};

	service.getAllAreas = function () {
		return service.areas;
	};

	service.getNeighbouringAreas = function (x, y) {
		var result = [];
		if (service.map[x+1]) result.push(service.map[x+1][y]);
		if (service.map[x-1]) result.push(service.map[x-1][y]);
		if (service.map[x][y+1]) result.push(service.map[x][y+1]);
		if (service.map[x][y-1]) result.push(service.map[x][y-1]);
		result = _.filter(result, function (tile) {
			return tile.area;
		});
		return result;
	};

	service.getAccessibleAreas = function (x, y, onlyOpen) {
		var result = {};
		var tile = service.map[x][y];
		_.each(directionOffsets, function (offset, direction) {
			if (tile[direction] && (!onlyOpen || !tile[direction].door || !tile[direction].closed)) {
				result[direction] = service.map[x + offset[0]][y + offset[1]];
			}
		});
		return result;
	};

	service.moveTeam = function (tile) {
		if (service.teamLocation) {
			service.teamLocation.teamPresent = false;
			service.teamLocation.teamHeat = service.teamSteps;
		}
		service.teamLocation = tile;
		service.teamSteps++;
		service.teamLocation.teamHeat = service.teamSteps;
		service.teamLocation.teamPresent = true;
		service.checkVisibility();
		service.calculateEnemyPaths();
	};

	service.moveEnemy = function (enemy, tileTo) {
		enemy.tile.enemies = _.without(enemy.tile.enemies, _.findWhere(enemy.tile.enemies, enemy));
		tileTo.enemies.push(enemy);
		enemy.tile = tileTo;
		service.checkVisibility();
	};

	service.registerValidTargets = function (tile, distance) {
		_.each(tile.enemies, function (enemy) {
			if (enemy.health > 0) {
				service.validTargets.push({
					tile: tile,
					enemy: enemy,
					distance: distance
				});
			}
		});
	};

	service.checkVisibility = function () {
		for (var x = 0; x < service.mapSizeX; x++) {
			for (var y = 0; y < service.mapSizeY; y++) {
				service.map[x][y].visible = false;
			}
		}
		service.map[service.teamLocation.x][service.teamLocation.y].visible = true;
		service.map[service.teamLocation.x][service.teamLocation.y].revealed = true;
		service.validTargets = [];
		service.registerValidTargets(service.teamLocation, 0);
		_.each(directions, function (direction) {
			var currentTile = service.teamLocation;
			var distance = 0;
			var directionOffset = directionOffsets[direction];
			do {
				var currentWay = currentTile[direction];
				if (!service.map[currentTile.x + directionOffset[0]]) {
					break;
				}
				currentTile = service.map[currentTile.x + directionOffset[0]][currentTile.y + directionOffset[1]];
				if (!currentTile || !currentWay || currentWay.closed) {
					break;
				}
				currentTile.visible = true;
				currentTile.revealed = true;
				distance++;
				currentTile.teamHeat = service.teamSteps - distance;
				service.registerValidTargets(currentTile, distance);
				if (currentTile.room) {
					break;
				}
			} while (true);
		});
	};

	service.calculateEnemyPaths = function () {
		_.each(service.areas, function (currentTile) {
			var neighbouring = service.getAccessibleAreas(currentTile.x, currentTile.y, true);
			var bestHeat = currentTile.teamHeat;
			var bestHeatDirection = '';
			_.each(neighbouring, function (tile, direction) {
				if (bestHeat < tile.teamHeat) {
					bestHeat = tile.teamHeat;
					bestHeatDirection = direction;
				}
			});
			currentTile.enemyDirection = bestHeat !== 0 ? bestHeatDirection : '-';
		});
	}

	service.getDirectionPathForTeam = function (direction) {
		return service.teamLocation[direction];
	};

	service.getTileInDirection = function (tile, direction) {
		var offset = directionOffsets[direction];
		return service.map[tile.x + offset[0]][tile.y + offset[1]];
	};

	service.getNextAreaForTeam = function (direction) {
		return service.map[service.teamLocation.x + directionOffsets[direction][0]][service.teamLocation.y + directionOffsets[direction][1]];
	};

	service.openDoor = function (path) {
		path.closed = false;
		service.checkVisibility();
		service.calculateEnemyPaths();
	};

	service.getValidTargets = function () {
		return service.validTargets;
	};

});


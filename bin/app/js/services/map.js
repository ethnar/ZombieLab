'use strict';

angular.module('ZombieLabApp')

.service('mapService', function ($timeout, eventService) {
	var directionOffsets = {
		'N': [0, -1],
		'S': [0, 1],
		'E': [1, 0],
		'W': [-1, 0]
	}

	var service = this;
	service.directions = ['N', 'E', 'S', 'W'];
	service.tileSize; // Needed for the camera
	service.map = [];
	service.areas = [];
	service.paths = [];
	service.spawners = [];
	service.mapSizeX = 10;
	service.mapSizeY = 8;
	service.startTile = null;
	service.finishTile = null;
	service.roomCount = 0;
	service.areaCount = 0;
	service.mapMargins = 2; // determines start/finish locations distance from borders
	service.teamLocation = null;
	service.validTargets = [];
	service.teamSteps = 10;

	service.getTileElement = function (tile) {
		return $('.map .column').eq(tile.x).find('.tile').eq(tile.y);
	};

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

	service.getAccessibleAreas = function (tile, onlyOpen) {
		var result = {};
		_.each(directionOffsets, function (offset, direction) {
			if (tile[direction] && (!onlyOpen || service.isOpen(direction, tile))) {
				result[direction] = service.map[tile.x + offset[0]][tile.y + offset[1]];
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
		eventService.fireTeamMove('test', 5);
	};

	service.moveEnemy = function (enemy, tileTo) {
		enemy.tile.enemies = _.without(enemy.tile.enemies, _.findWhere(enemy.tile.enemies, enemy));
		tileTo.enemies.push(enemy);
		enemy.tile = tileTo;
		service.checkVisibility();
	};

	service.registerValidTargets = function (tile, distance) {
		if (!tile.isLit()) {
			return;
		}
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
		_.each(service.directions, function (direction) {
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
				if (currentTile.room || true) {// only 1 sq sight range
					break;
				}
			} while (true);
		});
	};

	service.calculateEnemyPaths = function () {
		_.each(service.areas, function (currentTile) {
			var neighbouring = service.getAccessibleAreas(currentTile, true);
			var bestHeat = currentTile.teamHeat;
			var bestHeatDirection = '';
			_.each(neighbouring, function (tile, direction) {
				if (bestHeat < tile.teamHeat) {
					bestHeat = tile.teamHeat;
					bestHeatDirection = direction;
				}
			});
			currentTile.enemyDirection = bestHeat !== 0 ? bestHeatDirection : '';
		});
	};

	service.getDirectionPathForTeam = function (direction) {
		return service.teamLocation[direction];
	};

	service.getTileInDirection = function (tile, direction) {
		var offset = directionOffsets[direction];
		return service.map[tile.x + offset[0]][tile.y + offset[1]];
	};

	service.getNextAreaForTeam = function (direction) {
		if (!direction) {
			return service.teamLocation;	
		}
		return service.map[service.teamLocation.x + directionOffsets[direction][0]][service.teamLocation.y + directionOffsets[direction][1]];
	};

	service.isOpen = function (direction, tile) {
		tile = tile || service.teamLocation;
		return tile[direction] && (!tile[direction].door || !tile[direction].closed);
	};

	service.isDoor = function (direction, tile) {
		tile = tile || service.teamLocation;
		return tile[direction] && tile[direction].door;
	};

	service.openDoor = function (path) {
		path.closed = false;
		service.checkVisibility();
		service.calculateEnemyPaths();
	};

	service.closeDoor = function (path, security) {
		path.closed = true;
		path.security = security || 0;
		service.checkVisibility();
	};

	service.getValidTargets = function () {
		return service.validTargets;
	};

	service.addAnimation = function (tile, animation, duration) {
		var idx = _.size(tile.animations);
		tile.animations[idx] = animation;
		if (duration) {
			$timeout(function () {
				delete tile.animations[idx];
			}, duration);
		}
	};
});


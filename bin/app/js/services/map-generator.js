'use strict';

angular.module('ZombieLabApp')

.service('mapGeneratorService', function ($timeout, enemyService, mapService, equipmentService) {
	var directions = ['N', 'E', 'S', 'W'];
	var directionOffsets = {
		'N': [0, -1],
		'S': [0, 1],
		'E': [1, 0],
		'W': [-1, 0]
	}

	var service = this;

	service.wipeMap = function () {
		mapService.roomCount = 0;
		mapService.areaCount = 0;
		mapService.areas = [];
		for (var x = 0; x < mapService.mapSizeX; x++) {
			mapService.map[x] = [];
			for (var y = 0; y < mapService.mapSizeY; y++) {
				mapService.map[x][y] = {
					area: false,
					room: false,
					visible: false,
					enemies: [],
					items: [],
					teamHeat: 0,
					x: x,
					y: y
				};
			}
		}
	};

	service.placeArea = function (x, y) {
		if (!mapService.map[x][y].area) {
			var tile = mapService.map[x][y];
			tile.area = true;
			mapService.areaCount++;
			mapService.areas.push(tile);
			while (tile.items.length < 8) {
				tile.items.push(null);
			}
			return true;
		}
		return false;
	};

	service.placeRoom = function (x, y) {
		if (!mapService.map[x][y].room) {
			mapService.map[x][y].room = true;
			_.each(['S', 'N', 'E', 'W'], function (direction) {
				if (mapService.map[x][y][direction]) {
					mapService.map[x][y][direction].door = true;
					mapService.map[x][y][direction].closed = true;
				}
			});
			mapService.roomCount++;
			return true;
		}
		return false;
	};

	service.connectAreas = function (area1, area2) {
		if (area1.x === area2.x) {
			if (area1.y === area2.y - 1) {
				area1.S = area2.N = {};
			} else {
				area1.N = area2.S = {};
			}
		} else {
			if (area1.x === area2.x - 1) {
				area1.E = area2.W = {};
			} else {
				area1.W = area2.E = {};
			}
		}
	};

	var lastArea;
	service.generatePathCreateArea = function (x, y) {
		if (lastArea) {
			service.connectAreas(mapService.map[x][y], lastArea);
		}
		service.placeArea(x, y);
		lastArea = mapService.map[x][y];
	};
	
	service.generatePath = function () {
		lastArea = null;	
		var currentX = _.random(0, mapService.mapMargins);
		var currentY = _.random(0, mapService.mapSizeY - 1);
		var finishX = _.random(mapService.mapSizeX - mapService.mapMargins - 1, mapService.mapSizeX - 1);
		mapService.startTile = mapService.map[currentX][currentY];
		mapService.startTile.start = true;
		while (currentX <= finishX) {
			service.generatePathCreateArea(currentX, currentY);
			var sideSteps = _.random(0, 4);
			var sideStepDirection = (_.random(0, mapService.mapSizeY - 2) - currentY) < 0 ? -1 : 1;
			while (sideSteps > 0 && currentY + sideStepDirection >= 0 && currentY + sideStepDirection < mapService.mapSizeY) {
				currentY += sideStepDirection;
				sideSteps--;
				service.generatePathCreateArea(currentX, currentY);
			}
			currentX++;
		}
		mapService.finishTile = mapService.map[finishX][currentY];
		mapService.finishTile.finish = true;
	};

	service.placeAdditionalAreas = function () {
		var areasPlanned = mapService.mapSizeX * _.random(4, 4.8, true);
		var attempts = 0;
		var maxAttempts = (areasPlanned - mapService.areaCount) * 10;
		while (mapService.areaCount < areasPlanned && attempts < maxAttempts) {
			attempts++;
			var x = _.random(0, mapService.mapSizeX - 1);
			var y = _.random(0, mapService.mapSizeY - 1);
			var neighbouring = mapService.getNeighbouringAreas(x, y);
			if (neighbouring.length) {
				service.placeArea(x, y);
				// This part also creates extra connections between existing rooms
				service.connectAreas(mapService.map[x][y], _.sample(neighbouring));
			}
		}
	};

	service.sizeAreas = function () {
		service.placeRoom(mapService.finishTile.x, mapService.finishTile.y);
		service.placeRoom(mapService.startTile.x, mapService.startTile.y);

		var roomsPlanned = mapService.areaCount / _.random(2, 2.5, true); // every third to fourth area will be a room
		var attempts = 0;
		var maxAttempts = roomsPlanned * 10;

		while (mapService.roomCount < roomsPlanned && attempts < maxAttempts) {
			attempts++;
			var x = _.random(0, mapService.mapSizeX - 1);
			var y = _.random(0, mapService.mapSizeY - 1);
			if (mapService.map[x][y].area) {
				service.placeRoom(x, y);
			}
		}

		// ensure dead-ends are rooms
		for (var x = 0; x < mapService.mapSizeX; x++) {
			for (var y = 0; y < mapService.mapSizeY; y++) {
				var tile = mapService.map[x][y];
				if (!tile.room && tile.area) {
					var connections = 	(tile.N ? 1 : 0) + 
										(tile.E ? 1 : 0) + 
										(tile.S ? 1 : 0) + 
										(tile.W ? 1 : 0);
					if (connections === 1) {
						service.placeRoom(x, y);
					}
				}
			}
		}
	};

	service.fillRooms = function () {
		for (var x = 0; x < mapService.mapSizeX; x++) {
			for (var y = 0; y < mapService.mapSizeY; y++) {
				var tile = mapService.map[x][y];
				if (tile.area && !tile.start) {
					if (tile.room) {
						tile.enemies = enemyService.createGroupForRoom(tile);
						var idx = 0;
						while (_.random(0, 5) > idx) {
//							tile.items[idx++] = equipmentService.newWeapon(_.sample(equipmentService.weapons));
						}
					} else {
						tile.enemies = enemyService.createGroupForCorridor(tile);
					}
				}
			}
		}
	};

	service.createNewMap = function () {
		service.wipeMap();
		service.generatePath();
		service.placeAdditionalAreas();
		service.sizeAreas();
		service.fillRooms();
		mapService.moveTeam(mapService.startTile);
	};
});


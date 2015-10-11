'use strict';

angular.module('ZombieLabApp')

.service('mapGeneratorService', function ($timeout, enemyService, mapService, equipmentService, gameService) {
	var directions = ['N', 'E', 'S', 'W'];
	var directionOffsets = {
		'N': [0, -1],
		'S': [0, 1],
		'E': [1, 0],
		'W': [-1, 0]
	}

	var service = this;

	service.wipeMap = function () {
		mapService.teamSteps = 10;
		mapService.roomCount = 0;
		mapService.areaCount = 0;
		mapService.areas = [];
		mapService.paths = [];
		mapService.spawners = [];
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
					animations: {},
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
					mapService.map[x][y][direction].security = 0;
				}
			});
			mapService.roomCount++;
			return true;
		}
		return false;
	};

	service.connectAreas = function (area1, area2) {
		var path = {};
		mapService.paths.push(path);
		if (area1.x === area2.x) {
			if (area1.y === area2.y - 1) {
				area1.S = area2.N = path;
			} else {
				area1.N = area2.S = path;
			}
		} else {
			if (area1.x === area2.x - 1) {
				area1.E = area2.W = path;
			} else {
				area1.W = area2.E = path;
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

	var roomChanceSum = 0;
	service.pickRandomRoom = function (tile) {
		if (!roomChanceSum) {
			_.each(mapService.roomTypes, function (roomType) {
				roomChanceSum += roomType.chance;
			});
		}

		var random = _.random(1, roomChanceSum);

		_.each(mapService.roomTypes, function (roomType, roomTypeName) {
			if (random >= 0 && random <= roomType.chance) {
				tile.roomType = roomTypeName;
				random -= roomType.chance;
			} else {
				random -= roomType.chance;
			}
		});
		var roomType = mapService.roomTypes[tile.roomType];

		if (roomType.security) {
			service.lockRoomDoors(tile, Math.min(roomType.security, service.getMaxDoorSecurity()));
		}

		if (roomType.spawn) {
			service.createSpawner(tile, roomType);
		}

		tile.enemies = enemyService.createGroup(tile, roomType.enemies, roomType.enemiesSpecial);

		service.putItemsInRoom(roomType.items, tile);
	};

	service.createSpawner = function (tile, roomType) {
		tile.spawnRate = roomType.spawn;
		tile.spawnSpecial = roomType.spawnSpecial;
		tile.spawnTimer = 0;
		mapService.spawners.push(tile);
	};

	service.putItemsInRoom = function (items, tile) {
		var gameDifficulty = gameService.getDifficulty();
		var idx = 0;
		_.each(items, function (score, itemCategory) {
			switch (itemCategory) {
				case 'ammo':
					var amount = Math.floor(Math.sqrt(gameDifficulty) * score) * 3;
					var ammo = {};
					while (amount > 0) {
						var add = Math.min(_.random(3, 9));
						var ammoType = _.sample(equipmentService.itemTypes.ammo).name;
						amount -= add;
						ammo[ammoType] = ammo[ammoType] || 0;
						ammo[ammoType] += add;
					}
					_.each(ammo, function (qty, type) {
						var item = equipmentService.newItem(equipmentService.itemTypesByName[type]);
						item.quantity = qty;
						tile.items[idx++] = item;
					});
					break;
				case 'weapons':
					while (score > 0) {
						var random = Math.floor(_.random(gameDifficulty * 0.9, gameDifficulty * 1.1)) * Math.min(1, score);
						score -= 1;
						var selected = null;
						var difference = Infinity;
						_.each(equipmentService.itemTypes.weapons, function (weapon) {
							var currentDifference = Math.abs(weapon.gameDifficulty - random);
							if (currentDifference < difference) {
								selected = weapon;
								difference = currentDifference;
							}
						});
						tile.items[idx++] = equipmentService.newItem(selected);
					}
					break;
				case 'medications':
				case 'explosives':
				case 'hacking':
					var random = _.random(score * 0.8, score * 1.2, true);
					while (random > 0) {
						var validItems = _.filter(equipmentService.itemTypes[itemCategory], function (med) {
							return med.value <= random;
						});
						var item = _.sample(validItems);
						if (!item) {
							break;
						}
						tile.items[idx++] = equipmentService.newItem(item);
						random -= item.value;
					}
					break;
				default:
					console.warn('Oi! You forgot about ' + itemCategory);
			}
		});
	};

	service.lockRoomDoors = function (tile, security) {
		_.each(directions, function (direction) {
			if (tile[direction] && tile[direction].door) {
				tile[direction].security = Math.max(tile[direction].security, security);
			}
		});
	};

	service.fillRooms = function () {
		for (var x = 0; x < mapService.mapSizeX; x++) {
			for (var y = 0; y < mapService.mapSizeY; y++) {
				var tile = mapService.map[x][y];
				if (tile.area && !tile.start && !tile.finish) {
					if (tile.room) {
						service.pickRandomRoom(tile);
					} else {
						tile.enemies = enemyService.createGroup(tile, 0.3, 0);
					}
				}
			}
		}
	};

	service.getMaxDoorSecurity = function () {
		return Math.floor(Math.min(gameService.getDifficulty() / 100, 3));
	};

	service.lockDoors = function () {
		var maxSecurity = service.getMaxDoorSecurity();
		for (var i = 0; i < mapService.paths.length * maxSecurity / 6 ; i++) {
			var selected = _.sample(mapService.paths);
			if (selected.door && selected.security < maxSecurity) {
				selected.security++;
			}
		}
	};

	service.fixCorridors = function () {
		for (var x = 0; x < mapService.mapSizeX - 1; x++) {
			for (var y = 0; y < mapService.mapSizeY - 1; y++) {
				var tile = mapService.map[x][y];
				if (!tile.room && tile.E && tile.S) {
					var tileE = mapService.map[x + 1][y];
					var tileS = mapService.map[x][y + 1];
					if (!tileE.room && tileE.S && !tileS.room && tileS.E) {
						var tileSE = mapService.map[x + 1][y + 1];
						if (!tileSE.room) {
							var random = _.sample(directions);
							switch (random) {
								case 'E': 
									delete tile.E;
									delete tileE.W;
									break;
								case 'S':
									delete tileE.S;
									delete tileSE.N;
									break;
								case 'W':
									delete tileSE.W;
									delete tileS.E;
									break;
								case 'N':
									delete tileS.N;
									delete tile.S;
									break;
							}
						}
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
		service.lockDoors();
		service.fixCorridors();
		mapService.moveTeam(mapService.startTile);
	};
});


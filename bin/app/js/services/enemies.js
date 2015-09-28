'use strict';

angular.module('ZombieLabApp')

.service('enemyService', function (equipmentService, gameService, mapService) {
	var service = this;

	service.enemyTypes = [{
		name: 'crawler',
		speed: 4100,
		health: 7,
		damage: 3,
		difficulty: 20,
		filler: true
	}, {
		name: 'walker',
		speed: 3800,
		health: 10,
		damage: 4,
		difficulty: 30,
		filler: true
	}, {
		name: 'hulk',
		speed: 6000,
		health: 180,
		damage: 30,
		difficulty: 150,
		minDifficulty: 180 // minimum overall difficulty to have the monster spawned in a room
	}, {
		name: 'runner',
		speed: 1500,
		health: 9,
		damage: 8,
		difficulty: 60,
		minDifficulty: 300
	}];

	service.newEnemy = function (type, tile) {
		return {
			type: type,
			health: type.health,
			walking: 0,
			attackTimer: 0,
			tile: tile,
			speed: _.random(Math.round(type.speed *0.9), Math.round(type.speed *1.1))
		}
	};

	service.createGroup = function (tile, roomDifficulty, chanceToHaveZombies, specialGroupsBudget) {
		var hasZobmies = (_.random(0, 100) < chanceToHaveZombies);
		var enemiesGroup = [];
		if (hasZobmies) {
			var maxRoomDifficulty = _.random(roomDifficulty * 0.6, roomDifficulty);
			var remainingRoomDifficulty = maxRoomDifficulty;
			while (specialGroupsBudget > 100) {
				specialGroupsBudget -= 100;
				var specialTypes = _.filter(service.enemyTypes, function (enemyType) {
					return !enemyType.filler && enemyType.minDifficulty <= gameService.getDifficulty() && enemyType.difficulty <= remainingRoomDifficulty;
				});
				var type = _.sample(specialTypes);
				if (type) {
					enemiesGroup.push(service.newEnemy(type, tile));
					remainingRoomDifficulty -= type.difficulty;
				}
			}
			var fillerTypes = _.filter(service.enemyTypes, function (enemyType) {
				return enemyType.filler;
			});
			while (remainingRoomDifficulty >= 0) {
				var type = _.sample(fillerTypes);
				enemiesGroup.push(service.newEnemy(type, tile));
				remainingRoomDifficulty -= type.difficulty;
			}
		}
		return enemiesGroup;
	};
	
	service.createGroupForRoom = function (tile) {
		var roomDifficulty = gameService.getDifficulty();
		var chanceToHaveZombies = -1 / (gameService.getDifficulty() / 4000) + 95;
		var specialGroupsBudget = _.random(0, gameService.getDifficulty() / 2);
		return service.createGroup(tile, roomDifficulty, chanceToHaveZombies, specialGroupsBudget);
	};

	service.createGroupForCorridor = function (tile) {
		var roomDifficulty = gameService.getDifficulty() / 3;
		var chanceToHaveZombies = -1 / (gameService.getDifficulty() / 2000) + 95;
		var specialGroupsBudget = 0;
		return service.createGroup(tile, roomDifficulty, chanceToHaveZombies, specialGroupsBudget);
	};

});


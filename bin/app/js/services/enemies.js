'use strict';

angular.module('ZombieLabApp')

.service('enemyService', function (equipmentService, gameService, mapService) {
	var service = this;

	service.enemyTypes = [{
		name: 'walker',
		speed: 5100,
		health: 5,
		damage: 3,
		difficulty: 16,
		filler: true
	}, {
		name: 'brute',
		speed: 9000,
		health: 80,
		damage: 20,
		difficulty: 80,
		minDifficulty: 300 // minimum overall difficulty to have the monster spawned in a room
	}, {
		name: 'runner',
		speed: 1500,
		health: 18,
		damage: 5,
		difficulty: 30,
		minDifficulty: 180
	}];
	service.enemyTypesFillers = _.filter(service.enemyTypes, function (enemyType) {
		return enemyType.filler;
	});
	service.enemyTypesSpecials = _.filter(service.enemyTypes, function (enemyType) {
		return !enemyType.filler;
	});

	var getEnemyTypesSpecialsForLevelCache = {};
	service.getEnemyTypesSpecialsForLevel = function () {
		var difficulty = gameService.getDifficulty();
		if (!getEnemyTypesSpecialsForLevelCache[difficulty]) {
			getEnemyTypesSpecialsForLevelCache[difficulty] = _.filter(service.enemyTypesSpecials, function (enemyType) {
				return enemyType.minDifficulty <= gameService.getDifficulty();
			});
		}
		return getEnemyTypesSpecialsForLevelCache[difficulty];
	};

	service.newEnemy = function (type, tile) {
		return {
			type: type,
			health: type.health,
			walking: 0,
			attackTimer: 0,
			tile: tile,
			speed: _.random(Math.round(type.speed *0.9), Math.round(type.speed *1.1)),
			roomX: _.random(5, 66),
			roomY: _.random(3, 66)
		}
	};

	service.damage = function (enemy, damage) {
		enemy.health -= damage;
		if (enemy.health <= 0) {
			service.killEnemy(enemy);
		}
	};

	service.killEnemy = function (enemy) {
		enemy.tile.enemies = _.without(enemy.tile.enemies, _.findWhere(enemy.tile.enemies, enemy)); 
		mapService.checkVisibility();
	};

	service.createGroup = function (tile, zombieAmount, specialZombieAmount) {
		zombieAmount = zombieAmount || 0;
		specialZombieAmount = specialZombieAmount || 0;

		var roomDifficulty = (gameService.getDifficulty() / 5 + 80) * zombieAmount;
		var chanceToHaveZombies = -1 / (gameService.getDifficulty() / 4000) + 95;
		var specialGroupsBudget = _.random(0, gameService.getDifficulty()) * specialZombieAmount;

		var hasZobmies = (_.random(0, 100) < chanceToHaveZombies); // TODO: fix the typo when it's no longer funny enough
		var enemiesGroup = [];
		if (hasZobmies) {
			var maxRoomDifficulty = _.random(roomDifficulty * 0.6, roomDifficulty);
			var remainingRoomDifficulty = maxRoomDifficulty;
			while (specialGroupsBudget > 200) {
				specialGroupsBudget -= 200;
				var specialTypes = _.filter(service.enemyTypesSpecials, function (enemyType) {
					return enemyType.minDifficulty <= gameService.getDifficulty() && enemyType.difficulty <= remainingRoomDifficulty;
				});
				var type = _.sample(specialTypes);
				if (type) {
					enemiesGroup.push(service.newEnemy(type, tile));
					remainingRoomDifficulty -= type.difficulty;
				}
			}
			while (remainingRoomDifficulty >= 0) {
				var type = _.sample(service.enemyTypesFillers);
				enemiesGroup.push(service.newEnemy(type, tile));
				remainingRoomDifficulty -= type.difficulty;
			}
		}
		return enemiesGroup;
	};

});


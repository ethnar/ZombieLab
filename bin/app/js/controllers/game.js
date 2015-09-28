'use strict';

angular.module('ZombieLabApp')

.controller('gameController', function ($scope, $location, $document, $interval, characterService, enemyService, mapService, mapGeneratorService, gameService) {
	var controller = this;

	$scope.model = {
		team: characterService.team,
		teamTired: 0, // indicates taking part in shootout
		map: mapService.map,
		currentAction: {
			actionObject: null,
			target: null,
			progress: 0
		}
	};
	var interval = 10,
		actions = {
			openDoor: {
				progress: function (delta) {
					$scope.model.currentAction.progress += delta / 0.8;
				},
				complete: function () {
					mapService.openDoor($scope.model.currentAction.target);
				}
			},
			walk: {
				start: function () {
					$scope.model.currentAction.target.teamWalkingTo = true;
				},
				progress: function (delta) {
					$scope.model.currentAction.progress += delta / ($scope.model.teamTired > 0 ? 1.2 : 0.4);
				},
				complete: function () {
					$scope.model.currentAction.target.teamWalkingTo = false;
					mapService.moveTeam($scope.model.currentAction.target);
				},
				cancel: function () {
					$scope.model.currentAction.target.teamWalkingTo = false;
				}
			}
		};

	$scope.getMapTopOffset = function () {
		return $('#map-wrapper').height() / 2 - mapService.getTileSize() / 2 - mapService.teamLocation.y * mapService.tileSize;
	};

	$scope.getMapLeftOffset = function () {
		return $('#map-wrapper').width() / 2 - mapService.getTileSize() / 2 - mapService.teamLocation.x * mapService.tileSize;
	};

	$scope.bindKeys = function () {
		$document.bind('keydown', function (event) {
			var direction = null;
			switch (event.keyCode) {
				case 37:
					$scope.inputDirection('W');
					break;
				case 38:
					$scope.inputDirection('N');
					break;
				case 39:
					$scope.inputDirection('E');
					break;
				case 40:
					$scope.inputDirection('S');
					break;
				$scope.$apply();
			}
		});
	};

	$scope.swipe = function ($event) {
		var swipeTolerance = 30;
		switch (true) {
			case Math.abs($event.angle) <= swipeTolerance:
				$scope.inputDirection('E');
				break;
			case Math.abs($event.angle + 180) <= swipeTolerance:
				$scope.inputDirection('W');
				break;
			case Math.abs($event.angle + 90) <= swipeTolerance:
				$scope.inputDirection('N');
				break;
			case Math.abs($event.angle - 90) <= swipeTolerance:
				$scope.inputDirection('S');
				break;
		}
	};

	$scope.inputDirection = function (direction) {
		if ($scope.model.currentAction.actionObject || gameService.isGameOver) {
			// ignore keypress if there's an action going or if the game's over
			return;
		};
		var path = mapService.getDirectionPathForTeam(direction);
		switch (true) {
			case !path: 
				return;
			case path.door && path.closed: 
				$scope.startAction(actions.openDoor, path);
				return;
			default:
				$scope.startAction(actions.walk, mapService.getNextAreaForTeam(direction));
		}
	};

	$scope.startAction = function (action, target) {
		$scope.model.currentAction.actionObject = action;
		$scope.model.currentAction.progress = 0;
		$scope.model.currentAction.target = target;
		if ($scope.model.currentAction.actionObject.start) {
			$scope.model.currentAction.actionObject.start();
		}
	};

	$scope.cancelAction = function () {
		if ($scope.model.currentAction.actionObject.cancel) {
			$scope.model.currentAction.actionObject.cancel();
		}
		$scope.model.currentAction.actionObject = null;
		$scope.model.currentAction.progress = 0;
		$scope.model.currentAction.target = null;
	};

	$scope.mainLoop = function () {
		var lastTime = new Date();
		$interval(function () {
			if (gameService.isGameOver) {
				return;
			}
			var currentTime = new Date(),
				delta = currentTime - lastTime;
			controller.updateTeamSpeed(delta);
			controller.progressAction(delta);
			controller.doTheShooting(delta);
			controller.doTheWalking(delta);
			lastTime = currentTime;
		}, interval);
	};

	controller.updateTeamSpeed = function (delta) {
		if ($scope.model.teamTired > 0) {
			$scope.model.teamTired -= delta;
		}
	};

	controller.progressAction = function (delta) {
		if ($scope.model.currentAction.actionObject) {
			$scope.model.currentAction.actionObject.progress(delta);
			if ($scope.model.currentAction.progress >= 1000) {
				$scope.model.currentAction.actionObject.complete();
				$scope.model.currentAction.actionObject = null;
			}
		}
	};

	controller.doTheShooting = function (delta) {
		_.each(_.shuffle(characterService.team), function (character) {
			if (character.weapon && character.conscious && character.active && character.alive) {
				if (character.weapon.ammo > 0 && character.reloadingTimer <= 0) {
					if (character.rofTimer <= 0) {
						var validTargets = _.groupBy(mapService.getValidTargets(), 'distance');
						var target = null;
						_.each(validTargets, function (targetsGroup) {
							if (!target) {
								target = _.sample(targetsGroup);
							}
						});
						if (target) {
							controller.shootAt(target, character);
						}
					}
				} else {
					characterService.reloading(character, delta);
				}
				if (character.rofTimer > 0) {
					character.rofTimer -= delta;
				}
			}
		});
	};

	controller.shootAt = function (target, character) {
		$scope.model.teamTired = 2000;
		// TODO: they need to miss too
		// TODO: and aiming time?
		character.rofTimer += character.weapon.model.rof;
		target.enemy.health -= _.random(character.weapon.model.dmgMin, character.weapon.model.dmgMax);
		console.log(_.sample(['BAM!', 'POW!', 'KABLAM!']));
		if (target.enemy.health <= 0) {
			controller.killTarget(target);
		}
		character.weapon.ammo -= 1;
		if (character.weapon.ammo === 0) {
			characterService.startReloading(character);
		}
	};

	controller.killTarget = function (target) {
		target.enemy.tile.enemies = _.without(target.enemy.tile.enemies, _.findWhere(target.enemy.tile.enemies, target.enemy)); 
		mapService.checkVisibility();
	};

	controller.doTheBiting = function (enemy) {
		enemy.attackTimer += _.random(900, 1100); // fixed for now
		var attackedTeamMember = _.sample(characterService.getAliveMembers());
		if (attackedTeamMember) {
			console.log('OM NOM NOM!');
			characterService.doDamage(attackedTeamMember, _.random(Math.floor(enemy.type.damage * 0.8), enemy.type.damage));
		};
	};

	controller.doTheWalking = function (delta) {
		_.each(mapService.areas, function (tile) {
			_.each(tile.enemies, function (enemy) {
				if (tile.enemyDirection == '') {
					enemy.walking = 0;
					if (enemy.attackTimer <= 0) {
						controller.doTheBiting(enemy);
					}
				} else {
					if (tile.enemyDirection !== '-') {
						enemy.walking += delta;
						if (enemy.walking > enemy.speed) {
							enemy.walking -= enemy.speed;
							var targetTile = mapService.getTileInDirection(tile, tile.enemyDirection);
							mapService.moveEnemy(enemy, targetTile);
						}
					}
				}
				if (enemy.attackTimer > 0) {
					enemy.attackTimer -= delta;
				}
			});
		});
		var validTargets = mapService.getValidTargets();

		_.each(validTargets, function (target) {
		});
	};

	$scope.backToMenu = function () {
		$location.path('main-menu');
	};

	$scope.canFinishLevel = function () {
		return mapService.teamLocation.finish;
	};

	$scope.finishLevel = function () {
		gameService.increaseDifficulty();
		mapGeneratorService.createNewMap();
	};

	$scope.isGameOver = function () {
		return gameService.isGameOver;
	};

	$scope.init = function () {
		/* START: quick setup */
		gameService.resetGame();

		if (characterService.team.length === 0) {
			for (var i = 0; i < 4; i++) {
				// TODO: make sure we get a nice, varied selection
				characterService.team.push(characterService.createNewCharacter());
			}
		}
		console.log('---- The team:')
		console.log(characterService.team);
		mapGeneratorService.createNewMap();
		console.log('---- The map:')
		console.log(mapService.map);
		/* END: quick setup */

		$scope.bindKeys();

		$scope.mainLoop();
	};
});

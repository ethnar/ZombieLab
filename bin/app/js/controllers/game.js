'use strict';

angular.module('ZombieLabApp')

.controller('gameController', function ($scope, $location, $document, $interval, characterService, enemyService, mapService, mapGeneratorService, gameService) {
	var controller = this;

	$scope.model = {
		team: characterService.team,
		map: mapService.map,
		currentAction: {
			actionObject: null,
			target: null,
			progress: 0
		}
	};
	var interval = 100,
		gameSpeed = 2,
		actions = {
			openDoor: {
				progress: function (delta) {
					$scope.model.currentAction.progress += gameSpeed * delta / 1;
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
					$scope.model.currentAction.progress += gameSpeed * delta / 2;
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
		return $('#map-wrapper').height() / 2 - mapService.tileSize / 2 - mapService.teamLocation.y * mapService.tileSize;
	};

	$scope.getMapLeftOffset = function () {
		return $('#map-wrapper').width() / 2 - mapService.tileSize / 2 - mapService.teamLocation.x * mapService.tileSize;
	};

	$scope.bindKeys = function () {
		$document.bind('keydown', function (event) {
			var direction = null;
			if ($scope.model.currentAction.actionObject) {
				// ignore keypress if there's an action going
				return;
			};
			switch (event.keyCode) {
				case 37:
					direction = 'W';
					break;
				case 38:
					direction = 'N';
					break;
				case 39:
					direction = 'E';
					break;
				case 40:
					direction = 'S';
					break;
			}
			if (direction) {
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
			}
			$scope.$apply();
		});
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
			var currentTime = new Date(),
				delta = currentTime - lastTime;
			if ($scope.model.currentAction.actionObject) {
				$scope.model.currentAction.actionObject.progress(delta);
				if ($scope.model.currentAction.progress >= 1000) {
					$scope.model.currentAction.actionObject.complete();
					$scope.model.currentAction.actionObject = null;
				}
			}
			controller.doTheShooting(delta);
			controller.doTheWalking(delta);
			lastTime = currentTime;
		}, interval);
	};

	controller.doTheShooting = function (delta) {
		_.each(_.shuffle(characterService.team), function (character) {
			if (character.weapon && character.conscious && character.active && character.alive) {
				if (character.weapon.ammo > 0) {
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
		// TODO: they need to miss too
		// TODO: and aiming time?
		character.rofTimer += character.weapon.model.rof;
		target.enemy.health -= _.random(character.weapon.model.dmgMin, character.weapon.model.dmgMax);
		console.log(_.sample(['BAM!', 'POW!', 'KABLAM!']));
		if (target.enemy.health <= 0) {
			mapService.killTarget(target);
		}
		character.weapon.ammo -= 1;
		if (character.weapon.ammo === 0) {
			characterService.startReloading(character);
		}
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
			// if (tile.enemies && tile.enemies.length) {
				
			// }
			// var neighbouring = mapService.getNeighbouringAreas(tile.x, tile.y);
			// if (neighbouring.length) {
				
			// }
		});
		var validTargets = mapService.getValidTargets();

		_.each(validTargets, function (target) {
			if (target.distance == 0) {
				target.enemy.walking = 0;
				if (target.enemy.attackTimer <= 0) {
					controller.doTheBiting(target.enemy);
				}
			} else {
				
			}
			if (target.enemy.attackTimer > 0) {
				target.enemy.attackTimer -= delta;
			}
		});
	};

	$scope.init = function () {
		/* START: quick setup */
		gameService.resetDifficulty();

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
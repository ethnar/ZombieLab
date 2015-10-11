'use strict';

angular.module('ZombieLabApp')

.controller('gameController', function ($scope, $location, $document, $interval, modalService, characterService, enemyService, mapService, mapGeneratorService, gameService, equipmentService) {
	var controller = this;

	$scope.model = {
		team: characterService.team,
		ammo: equipmentService.ammo,
		teamTired: 0, // indicates taking part in shootout
		map: mapService.map,
		lootingRoom: false,
		selectedCharacter: null,
		gameReady: false,
		currentAction: {
			actionObject: null,
			target: null,
			progress: 0
		}
	};
	var interval = 40,
		actions = {
			openDoor: {
				progress: function (delta) {
					$scope.model.currentAction.progress += delta / (0.2 + Math.pow($scope.model.currentAction.target.security, 3) * 5);
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
			},
			useItem: {
				start: function () {
					$scope.model.currentAction.itemOwner = gameService.getSelectedItemOwner();
					if ($scope.model.currentAction.itemOwner) {
						$scope.model.currentAction.itemSlot = gameService.getSelectedItemSlot();
						$scope.model.currentAction.item = gameService.getSelectedItem();
						$scope.model.currentAction.itemSlot.tempDisabled = true;
						$scope.model.currentAction.itemOwner.active = false;
						if ($scope.model.currentAction.item.model.useChargeAtStart) {
							if ($scope.model.currentAction.item.charges && !(--$scope.model.currentAction.item.charges)) {
								$scope.model.currentAction.itemSlot.item = null;
							}
						}
					} else {
						$scope.cancelAction();
					}
				},
				progress: function (delta) {
					if ($scope.model.currentAction.itemOwner.canPerformAction()) {
						var continueAction = true;
						var timeTaken = $scope.model.currentAction.item.model.actionTime;
						if ($scope.model.currentAction.item.model.progress) {
							continueAction = $scope.model.currentAction.item.model.progress($scope.model.currentAction.itemSlot, $scope.model.currentAction.itemOwner, $scope.model.currentAction.target, delta / (timeTaken * 10));
						}
						if (timeTaken) {
							$scope.model.currentAction.progress += delta / timeTaken;
						} else {
							$scope.model.currentAction.progress += delta / continueAction;
						}
						if (!continueAction) {
							$scope.cancelAction();
						}
					} else {
						$scope.cancelAction();
					}
				},
				complete: function () {
					$scope.model.currentAction.item.model.use($scope.model.currentAction.itemSlot, $scope.model.currentAction.itemOwner, $scope.model.currentAction.target);
					$scope.model.currentAction.itemSlot.tempDisabled = false;
					$scope.model.currentAction.itemOwner.active = true;
					if (!$scope.model.currentAction.item.model.useChargeAtStart) {
						if ($scope.model.currentAction.item.charges && !(--$scope.model.currentAction.item.charges)) {
							$scope.model.currentAction.itemSlot.item = null;
						}
					}
					$scope.model.currentAction.item = null;
					$scope.model.currentAction.itemOwner = null;
				},
				cancel: function () {
					if ($scope.model.currentAction.itemOwner) {
						$scope.model.currentAction.itemOwner.active = true;
						$scope.model.currentAction.itemSlot.tempDisabled = false;
					}
					$scope.model.currentAction.item = null;
					$scope.model.currentAction.itemOwner = null;
				}
			}
		};

	$scope.getMapTopOffset = function () {
		return $('#game-area').height() / 2 - mapService.getTileSize() / 2 - mapService.teamLocation.y * mapService.tileSize;
	};

	$scope.getMapLeftOffset = function () {
		return $('#game-area').width() / 2 - mapService.getTileSize() / 2 - mapService.teamLocation.x * mapService.tileSize;
	};

	$scope.showCharacterInfo = function (character) {
		$scope.model.selectedCharacter = character;
		gameService.pause();
		var modal = modalService.open({
			template: 'character-info-modal.html',
			scope: $scope
		});

		modal.on('close', function () {
			gameService.unpause();
		});
	};

	$scope.clickCharacter = function (character) {
		if (gameService.isItemSelected()) {
			var item = gameService.getSelectedItem();
			if (item.model.target === 'character' && character.alive) {
				$scope.startAction(actions.useItem, character);
			}
			gameService.deselectItem();
			return;
		}
	};

	$scope.bindKeys = function () {
		$document.bind('keydown', function (event) {
			var direction = null;
			switch (event.keyCode) {
				case 32:
					$scope.inputDirection('');
					break;
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

	$scope.inputDirection = function (direction) {
		if (gameService.isGameOver) {
			// ignore action if the game's over
			return;
		};
		$scope.finishSearching();
		if ($scope.model.currentAction.actionObject) {
			if ($scope.isTeamMoving() && (!direction || $scope.model.currentAction.target !== mapService.getNextAreaForTeam(direction))) {
				// user tapped another direction
				$scope.cancelAction();
			}
			return;
		}
		if (gameService.isItemSelected()) {
			if (!direction) {
				$scope.dropSelectedItem();
			} else {
				var item = gameService.getSelectedItem();
				if (item.model.target === 'area') {
					$scope.startAction(actions.useItem, direction);
				}
			}
			gameService.deselectItem();
			return;
		}
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

	$scope.dropSelectedItem = function () { 
		mapService.dropItem(gameService.selectedItemSlot, mapService.teamLocation);
	};

	$scope.isTeamMoving = function () {
		return $scope.model.currentAction.actionObject === actions.walk;
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
			lastTime = currentTime;
			if (gameService.gamePaused) {
				return;
			}
			controller.updateTeamSpeed(delta);
			controller.progressAction(delta);
			controller.doTheShooting(delta);
			controller.doTheWalking(delta);
			controller.spawnZombies(delta);
		}, interval);
	};

	controller.spawnZombies = function (delta) {
		_.each(mapService.spawners, function (spawnerTile) {
			if (spawnerTile.teamHeat) {
				spawnerTile.spawnTimer -= delta;
				if (spawnerTile.spawnTimer < 0) {
					var random = _.random(1, 100);
					if (random < 5) {
						var enemy = _.sample(enemyService.enemyTypesSpecials);
					} else {
						var enemy = _.sample(enemyService.enemyTypesFillers);
					}
					spawnerTile.enemies.push(enemyService.newEnemy(enemy, spawnerTile));
					mapService.checkVisibility();
					spawnerTile.spawnTimer += _.random(10000, 16000) / spawnerTile.spawnRate;
				}
			}
		});
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
			if (character.weapon && character.weapon.model.category === 'weapons' && character.canShoot()) {
				if (character.weapon.ammo > 0 && character.reloadingTimer <= 0) {
					var validTargets = _.groupBy(mapService.getValidTargets(), 'distance');
					var target = null;
					_.each(validTargets, function (targetsGroup, distance) {
						if (!target && character.weapon.model.range >= distance) {
							target = _.sample(targetsGroup);
						}
					});
					if (target) {
						if (character.rofTimer <= 0) {
							controller.shootAt(target, character);
							character.resetAim();
						} else {
							character.rofTimer -= delta;
						}
					} else {
						character.resetAim();
					}
				} else {
					characterService.reloading(character, delta);
					character.resetAim();
				}
			}
		});
	};

	controller.shootAt = function (target, character) {
		$scope.model.teamTired = 2000;
		var chanceToHit = character.weapon.model.baseChanceToHit * character.skillModifier('weapons', character.weapon.model.skillRequired);

		character.weapon.ammo -= 1;
		if (character.weapon.ammo === 0) {
			characterService.startReloading(character);
		}

		var weaponFrame = character.$element.find('.weapon');
		if (_.random(1, 100) < chanceToHit) {
			enemyService.damage(target.enemy, _.random(character.weapon.model.dmgMin, character.weapon.model.dmgMax));
			weaponFrame.find('.weapon-miss').css({opacity: 0});
			// TODO: turn into CSS animation to support Zepto  in some shape or form
			weaponFrame.find('.weapon-hit').stop(true).css({opacity: 1}).animate({opacity: 1}, 600, function () {
				weaponFrame.find('.weapon-hit').animate({opacity: 0}, 400);
			});
		} else {
			weaponFrame.find('.weapon-hit').css({opacity: 0});
			// TODO: turn into CSS animation to support Zepto  in some shape or form
			weaponFrame.find('.weapon-miss').stop(true).css({opacity: 1}).animate({opacity: 1}, 600, function () {
				weaponFrame.find('.weapon-miss').animate({opacity: 0}, 400);
			});
		}
	};

	controller.doTheBiting = function (enemy) {
		enemy.attackTimer += _.random(900, 1100); // fixed for now
		var attackedTeamMember = _.sample(characterService.getAliveMembers());
		if (attackedTeamMember) {
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
							var chanceToWalk = Math.max(100 - Math.max(mapService.teamSteps - tile.teamHeat - 3, 0) * 5, 50);
							if (_.random(1, 100) < chanceToWalk) {
								var targetTile = mapService.getTileInDirection(tile, tile.enemyDirection);
								mapService.moveEnemy(enemy, targetTile);
							}
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

	$scope.getTeamLocation = function () {
		return mapService.teamLocation;
	};

	$scope.canFinishLevel = function () {
		return mapService.teamLocation.finish;
	};

	$scope.canSearchRoom = function () {
		return mapService.hasItems(mapService.teamLocation);
	};

	$scope.searchRoom = function () {
		$scope.model.lootingRoom = true;
	};

	$scope.finishSearching = function () {
		$scope.model.lootingRoom = false;
	};

	$scope.finishLevel = function () {
		$scope.model.gameReady = false;
		gameService.startLoading().then(function () {
			gameService.increaseDifficulty();
			mapGeneratorService.createNewMap();
			gameService.finishLoading(200).then(function () {
				$scope.model.gameReady = true;
			});
		});
	};

	$scope.isGameOver = function () {
		return gameService.isGameOver;
	};

	$scope.init = function () {
		/* START: quick setup */
		if (characterService.team.length === 0) {
			//$location.path('main-menu');

			gameService.resetGame();

			characterService.addToTeam(characterService.createNewCharacter(characterService.archetypes['warrior']));
			characterService.addToTeam(characterService.createNewCharacter(characterService.archetypes['medic']));
			characterService.addToTeam(characterService.createNewCharacter(characterService.archetypes['hacker']));
			characterService.addToTeam(characterService.createNewCharacter(characterService.archetypes['grenadier']));

			console.log('---- The team:')
			console.log(characterService.team);
			mapGeneratorService.createNewMap();
			console.log('---- The map:')
			console.log(mapService.map);
		}
		/* END: quick setup */

		$scope.bindKeys();

		$scope.mainLoop();

		gameService.finishLoading(200).then(function () {
			$scope.model.gameReady = true;
		});
	};
});

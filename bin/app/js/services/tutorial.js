'use strict';

angular.module('ZombieLabApp')

.run(function ($interval, $rootScope, gameService, mapService) {
	var waitForTouchEvents = false;
	var tutorialHints = [{
		/*********************************************************************************/
		text: 'Select 4 characters for your squad<br/>Consider each character\'s items and skills',
		condition: function () {
			return commons.teamSelection && $('.team-setup .item:visible').length;
		},
		considerDone: function () {
			return commons.mainGame;
		},
		getHighlights: function () {
			return _.union(
				getElementHighlight($('.team-setup .items').eq(1), 50),
				getElementHighlight($('.skills').eq(1), 60)
			);
		}
	}, {
		/*********************************************************************************/
		text: 'Tap & hold to see item details',
		delay: 2,
		condition: function () {
			return commons.teamSelection && $('.team-setup .item:visible').length;
		},
		considerDone: function () {
			return commons.mainGame;
		},
		getHighlights: function () {
			return getElementHighlight($('.team-setup .item-slot.small .item:visible,.team-setup .item:visible').eq(2), 60);
		}
	}, {
		/*********************************************************************************/
		text: 'Tap character image to include them in your team',
		delay: 3,
		condition: function () {
			return commons.teamSelection && $('.character-wrapper').length && !$('.character-wrapper.selected').length;
		},
		considerDone: function () {
			return commons.mainGame || $('.character-wrapper.selected').length;
		},
		getHighlights: function () {
			return getElementHighlight($('.character-panel .image'), 80);
		}
	}, {
		/*********************************************************************************/
		text: 'You will need 4 characters for your team',
		delay: 7,
		condition: function () {
			return commons.teamSelection && $('.character-wrapper.selected').length < 4;
		},
		considerDone: function () {
			return commons.mainGame;
		},
		getHighlights: function () {
			return getElementHighlight($('.character-wrapper:not(.selected) .image'), 80);
		}
	}, {
		/*********************************************************************************/
		text: 'You can start the game',
		delay: 2,
		position: 'top',
		condition: function () {
			return commons.teamSelection && $('.character-wrapper.selected').length == 4;
		},
		considerDone: function () {
			return commons.mainGame;
		},
		getHighlights: function () {
			return getElementHighlight($('button.start-game'), 50);
		}
	}, {
		/*********************************************************************************/
		text: 'Tap in direction to open door',
		delay: 3,
		condition: function () {
			return commons.mainGame && !commons.takingAction;
		},
		considerDone: function () {
			return $('.wall.has-door.opened').length;
		},
		getHighlights: function () {
			return getElementHighlight($('.start .wall.has-door:visible'), 30);
		}
	}, {
		/*********************************************************************************/
		text: 'Tap nearby room to move there',
		delay: 3,
		condition: function () {
			return commons.mainGame && !commons.fighting && !commons.takingAction && $('.wall.has-door.opened').length && mapService.teamLocation.start;
		},
		considerDone: function () {
			return commons.mainGame && !mapService.teamLocation.start;
		},
		getHighlights: function () {
			return getElementHighlight($('.area.visible:not(.start):visible'), 80);
		}
	}, {
		/*********************************************************************************/
		text: 'This room has some items here<br/>Tap "Search" to see what\'s there',
		delay: 1,
		condition: function () {
			return commons.mainGame && !commons.fighting && !commons.takingAction && mapService.hasItems(mapService.teamLocation);
		},
		considerDone: function () {
			return $('.loot-window:visible').length;
		},
		getHighlights: function () {
			return _.union(
				getElementHighlight($('.action-panel .action.search'), 80),
				getElementHighlight($('.action-direction.center'), 80)
			);
		}
	}, {
		/*********************************************************************************/
		text: 'Simply tap ammo to pick it up',
		delay: 1,
		condition: function () {
			return commons.mainGame && $('.loot-window:visible img[src*="ammo"]').length;
		},
		considerDone: function () {
			return false;
		},
		getHighlights: function () {
			return getElementHighlight($('.loot-window img[src*="ammo"]'), 30);
		}
	}, {
		/*********************************************************************************/
		text: 'Tap item to select it<br/>and then tap empty slot to pick it up',
		delay: 1,
		condition: function () {
			return commons.mainGame && $('.loot-window:visible img:not([src*="ammo"])').length;
		},
		considerDone: function () {
			return false;
		},
		getHighlights: function () {
			return _.union(
				getElementHighlight($('.loot-window:visible img:not([src*="ammo"])').first(), 30),
				getElementHighlight($('.team-panel .item-slot .item:not(:visible)').first().parents('.item-slot'), 30)
			);
		}
	}, {
		/*********************************************************************************/
		text: 'Those are zombies<br/>Your team automatically shoots at them',
		delay: 0,
		condition: function () {
			return commons.mainGame && $('.tile.visible .enemies-panel .enemy').length;
		},
		considerDone: function () {
			return false;
		},
		getHighlights: function () {
			return getElementHighlight($('.tile.visible .enemies-panel .enemy').parents('.enemies-panel').first(), 30);
		}
	}, {
		/*********************************************************************************/
		text: 'All actions take time, including walking<br/>Progress is shown in top-right corner',
		delay: 1,
		condition: function () {
			return commons.mainGame && commons.takingAction;
		},
		considerDone: function () {
			return false;
		},
		getHighlights: function () {
			return getElementHighlight($('.action-progress'), 50);
		}
	}, {
		/*********************************************************************************/
		text: 'From here you can go to the next level',
		delay: 0,
		condition: function () {
			return $('.action.next-level:visible').length;
		},
		considerDone: function () {
			return false;
		},
		getHighlights: function () {
			return getElementHighlight($('.action.next-level'), 80);
		}
	}];


	// TODO: use explosives, tougher enemies, reload weapon, exit level, biting, healing, swap items (?)

	var commonsCalculations = {
		teamSelection: function () {
			return $('.team-setup').length;
		},
		mainGame: function () {
			return $('.game').length;
		},
		fighting: function () {
			return !$('.team-running:visible').length;
		},
		takingAction: function () {
			return $('.action-progress:visible').length;
		}
	}
	var commons = {};

	var delays = {};
	function delay(category, condition, time) {
		if (!condition || !delays[category]) {
			delays[category] = new Date();
		}
		return (new Date() - delays[category]) / 1000 >= time;
	}

	function getElementHighlight(elements, highlightSize) {
		var result = [];
		elements.each(function () {
			var element = $(this);
			var size = highlightSize || Math.max(element.outerHeight(), element.outerWidth());
			var offset = size * Math.pow(2, 1/2) / 2;
			result.push({
				x: element.offset().left + element.outerWidth() / 2 - offset,
				y: element.offset().top + element.outerHeight() / 2 - offset,
				size: offset * 2
			});
		});
		return result;
	}

	function closeHint() {
		var tutorialElements = $('.tutorial-highlight');
		$('.tutorial-overlay').css('opacity', 0);
		$('.tutorial-text').remove();
		setTimeout(function () {
			tutorialElements.remove();
			gameService.unpause();
			$('.tutorial-overlay').hide();
		}, 300);
		$('.tutorial-overlay').unbind('click');
	}

	function displayHint(hint) {
		delays = {};
		var highlights = hint.getHighlights();
		var last;
		var overlay = $('.tutorial-overlay');
		_.each(highlights, function (highlight) {
			var highlightElement;
			last = highlightElement = $('<div></div>')
				.addClass('tutorial-highlight')
				.css('width', highlight.size)
				.css('height', highlight.size)
				.css('top', highlight.y)
				.css('left', highlight.x)
				.appendTo(overlay);
		});
		$('.tutorial-overlay').show()
		setTimeout(function () {
			$('.tutorial-overlay').css('opacity', 0.3);
		}, 100);
		setTimeout(function () {
			$('.tutorial-overlay').unbind('click').click(closeHint);
		}, 400);
		$('<div></div>')
			.addClass('tutorial-text')
			.html(hint.text)
			.toggleClass('top', hint.position === 'top')
			.appendTo($('body'));
		overlay.show();
	};

	$(document).on('touchstart mousedown', function () {
		waitForTouchEvents = true;
	});

	$(document).on('touchend touchcancel mouseup', function () {
		waitForTouchEvents = false;
	});

	setInterval(function () {
		console.time('tutorial');
		if (waitForTouchEvents || !gameService.tutorialEnabled) {
			return;
		}
		if (gameService.isPaused()) {
			delays = {};
			return;
		}
		_.each(commonsCalculations, function (method, key) {
			commons[key] = method();
		});
		_.each(tutorialHints, function (hint, idx) {
			if (!hint.done) {
				var meetCondition = hint.condition();
				if (hint.delay) {
					meetCondition = delay(hint.text, meetCondition, hint.delay);
				}
				if (!gameService.isPaused() && meetCondition) {
					gameService.pause();
					displayHint(hint);
					// remove hint
					hint.done = true;
					$rootScope.$apply();
				} else if (hint.considerDone && hint.considerDone()) {
					hint.done = true;
				}
			};
		});
//		console.timeEnd('tutorial');
	}, 500);
});

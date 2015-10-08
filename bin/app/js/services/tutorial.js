'use strict';

angular.module('ZombieLabApp')

.run(function ($interval, $rootScope, gameService, mapService) {
	var waitForTouchEvents = false;
	var tutorialHints = [{
		/*********************************************************************************/
		text: 'Select 4 characters for your squad<br/>Consider each character\'s items and skills',
		condition: function () {
			return $('.team-setup .item:visible').length;
		},
		considerDone: function () {
			return $('.game').length;
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
		condition: function () {
			return $('.team-setup .item:visible').length;
		},
		considerDone: function () {
			return $('.game').length;
		},
		getHighlights: function () {
			return getElementHighlight($('.team-setup .item-slot.small .item:visible,.team-setup .item:visible').eq(2), 60);
		}
	}, {
		/*********************************************************************************/
		text: 'Tap character image to include them in your team',
		condition: function () {
			var nothingSelected = $('.character-wrapper').length && !$('.character-wrapper.selected').length;
			return delay('team-setup-any-character-selection', nothingSelected, 3);
		},
		considerDone: function () {
			return $('.game').length || $('.character-wrapper.selected').length;
		},
		getHighlights: function () {
			return getElementHighlight($('.character-panel .image'), 80);
		}
	}, {
		/*********************************************************************************/
		text: 'You will need 4 characters for your team',
		condition: function () {
			var charactersSelected = $('.character-wrapper.selected').length;
			return delay('team-setup-4-characters-selection', charactersSelected < 4, 15);
		},
		considerDone: function () {
			return $('.game').length;
		},
		getHighlights: function () {
			return getElementHighlight($('.character-wrapper:not(.selected) .image'), 80);
		}
	}, {
		/*********************************************************************************/
		text: 'You can start the game',
		condition: function () {
			var charactersSelected = $('.character-wrapper.selected').length;
			return delay('team-setup-go', charactersSelected == 4, 2);
		},
		considerDone: function () {
			return $('.game').length;
		},
		getHighlights: function () {
			return getElementHighlight($('button.start-game'), 50);
		}
	}];

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

	function displayHint(highlights, text) {
		delays = {};
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
			.html(text)
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
		if (waitForTouchEvents) {
			return;
		}
		if (gameService.isPaused()) {
			delays = {};
			return;
		}
		_.each(tutorialHints, function (hint, idx) {
			if (!hint.done) {
				if (!gameService.isPaused() && hint.condition()) {
					gameService.pause();
					displayHint(hint.getHighlights(), hint.text);
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

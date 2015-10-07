'use strict';

angular.module('ZombieLabApp')

.run(function ($interval, $rootScope, gameService, mapService) {
	var tutorialHints = [{
		condition: function () {
			return $('.team-setup .item:visible').length;
		},
		text: 'Tap & hold to see item details',
		getHighlights: function () {
			return [
				getElementHighlight($('.team-setup .item:visible'), 60)
			];
		}
	}];

	function getElementHighlight(element, highlightSize) {
		element = element.first();
		var size = highlightSize || Math.max(element.outerHeight(), element.outerWidth());
		var offset = size * Math.pow(2, 1/2) / 2;
		return {
			x: element.offset().left + element.outerWidth() / 2 - offset,
			y: element.offset().top + element.outerHeight() / 2 - offset,
			size: offset * 2
		};
	}

	function closeHint() {
		$('.tutorial-highlight,.tutorial-text').remove();
		gameService.unpause();
	}

	function displayHint(highlights, text) {
		var last;
		_.each(highlights, function (highlight) {
			last = $('<div></div>')
				.addClass('tutorial-highlight')
				.css('width', highlight.size)
				.css('height', highlight.size)
				.css('top', highlight.y)
				.css('left', highlight.x)
				.css('opacity', 0.6 / highlights.length)
				.appendTo($('body'))
				.click(closeHint);
		});
		$('<div></div>')
			.addClass('tutorial-text')
			.html(text)
			.appendTo($('body'));
	};

	setInterval(function () {
		if (gameService.isPaused()) {
			return;
		}
		_.each(tutorialHints, function (hint, idx) {
			if (hint.condition()) {
				gameService.pause();
				displayHint(hint.getHighlights(), hint.text);
				// remove hint
				tutorialHints.splice(idx, 1);
				$rootScope.$apply();
			};
		});
	}, 500);
});

(function () {

	var seed = Math.random(); 
	console.log('Random seed: ' + seed);

	var random = function () {
		seed = Math.sin(seed) * 10000;
		return seed - Math.floor(seed);
	};

	_.random = function (min, max, float) {
		if (!float) {
			return Math.floor(random() * (max - min + 1) + min);
		}
		return random() * (max - min) + min;
	};

	ZombieLab = {
	};

	ZombieLab.error = function (msg) {
		console.error(msg);
	};

	ZombieLab.touchSupport = ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch;

	if (ZombieLab.touchSupport) {
		ZombieLab.touchstart = 'touchstart';
		ZombieLab.touchend = 'touchend touchcancel';
		ZombieLab.tap = 'touchstart';
	} else {
		ZombieLab.touchstart = 'mousedown';
		ZombieLab.touchend = 'mouseup';
		ZombieLab.tap = 'click';
	}
})();
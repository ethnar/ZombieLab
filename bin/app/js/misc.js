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

})();
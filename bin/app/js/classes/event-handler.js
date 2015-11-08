'use strict';

angular.module('ZombieLabApp')

.run(function (equipmentService, gameService, mapService, eventService) {
	window.attachEventHandler = function (constructor, events) {
		var prototype = constructor.prototype;
		prototype.on = {};
		prototype.fire = {};

		_.each(events, function (event) {
			prototype['on' + event] = function (callback) {
				this.boundEvents = this.boundEvents || {};
				this.boundEvents[event] = this.boundEvents[event] || {};
				var idx = _.size(this.boundEvents[event]);
				this.boundEvents[event][idx] = callback;
				return {
					type: event,
					id: idx
				}
			}
			prototype['fire' + event] = function () {
				var fireArguments = arguments;
				this.boundEvents = this.boundEvents || {};
				_.each(this.boundEvents[event], function (callback) {
					callback.apply(null, fireArguments);
				});
			}
		});
		prototype.unbind = function (eventBinding) {
			var self = this;
			if (!Array.isArray(eventBinding)) {
				eventBinding = [eventBinding];
			}
			_.each(eventBinding, function (binding) {
				delete self.boundEvents[binding.type][binding.id];
			});
		}
	};
});


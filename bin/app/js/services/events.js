'use strict';

angular.module('ZombieLabApp')

.service('eventService', function () {
	var service = this;

	var supportedEvents = ['teamMove'];

	service.on = {};
	service.fire = {};

	var boundEvents = {};

	_.each(supportedEvents, function (event) {
		service.on[event] = function (callback) {
			boundEvents[event] = boundEvents[event] || {};
			var idx = _.size(boundEvents[event]);
			boundEvents[event][idx] = callback;
			return {
				type: event,
				id: idx
			}
		}
		service.fire[event] = function () {
			var fireArguments = arguments;
			_.each(boundEvents[event], function (callback) {
				callback.apply(fireArguments);
			});
		}
	});
	service.unbind = function (eventBinding) {
		delete boundEvents[eventBinding.type][eventBinding.id];
	}

	return service;
});


'use strict';

angular.module('ZombieLabApp')

.service('eventService', function () {
	var service = this;

	var supportedEvents = ['TeamMove', 'Update'];

	service.on = {};
	service.fire = {};

	var boundEvents = {};

	service.eventBinder = function (object, events) {
		object.boundEvents = {};
		_.each(events, function (event) {
			object['on' + event] = function (callback) {
				object.boundEvents[event] = object.boundEvents[event] || {};
				var idx = _.size(object.boundEvents[event]);
				object.boundEvents[event][idx] = callback;
				return {
					type: event,
					id: idx
				}
			}
			object['fire' + event] = function () {
				var fireArguments = arguments;
				_.each(object.boundEvents[event], function (callback) {
					callback.apply(null, fireArguments);
				});
			}
		});
		object.unbind = function (eventBinding) {
			if (!Array.isArray(eventBinding)) {
				eventBinding = [eventBinding];
			}
			_.each(eventBinding, function (binding) {
				delete object.boundEvents[binding.type][binding.id];
			});
		}
	};

	service.eventBinder(service, supportedEvents);

	return service;
});


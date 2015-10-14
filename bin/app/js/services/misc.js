angular.module('ZombieLabApp')

.service('modalService', function ($templateCache, $compile) {
	var service = this;
	var zIndex = 9000;

	function modalObject(object) {
		angular.extend(this, object);
		this.eventHandlers = {};
	};

	modalObject.prototype.callEvents = function (type) {
		_.each(this.eventHandlers[type], function (callback) {
			callback();
		});
	};

	modalObject.prototype.close = function () {
		angular.element(this.backdrop).remove();
		angular.element(this.content).remove();
		this.scope.$destroy();
		this.callEvents('close');
		zIndex -= 20;
	};

	modalObject.prototype.on = function (event, callback) {
		this.eventHandlers[event] = this.eventHandlers[event] || [];
		this.eventHandlers[event].push(callback);
	};

	service.open = function (modal) {
		modal = new modalObject(modal);
		modal.backdrop = $('<div class="modal-backdrop"></div>')
			.appendTo($('body'))
			.css('z-index', zIndex)
			.click(function () {
				modal.close();
			});

		modal.content = $('<div class="modal-content-wrapper"><div class="modal-content">' + $templateCache.get(modal.template) + '</div></div>')
			.appendTo($('body'))
			.css('z-index', zIndex + 10);



		modal.scope = modal.scope.$new();
 
		$compile(modal.content)(modal.scope);

		zIndex += 20;

		modal.scope.$close = function () {
			modal.close();
		};
		return modal;
	};
});
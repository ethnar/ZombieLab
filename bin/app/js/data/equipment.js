'use strict';

angular.module('ZombieLabApp')

.run(function (equipmentService) {
	equipmentService.registerItems({
		weapon: [
			{
				name: 'M4',
				weaponClass: 'rifle',
				isLarge: true,
				dmgMin: 3,
				dmgMax: 5,
				clipSize: 30,
				rof: 400, // miliseconds
				reload: 3000 // miliseconds
			}, {
				name: 'M1911',
				weaponClass: 'handgun',
				dmgMin: 3,
				dmgMax: 5,
				clipSize: 7,
				rof: 1100,
				reload: 2600
			}, {
				name: 'L131A1',
				weaponClass: 'handgun',
				dmgMin: 2,
				dmgMax: 4,
				clipSize: 17,
				rof: 900,
				reload: 2600
			}, {
				name: 'M608',
				weaponClass: 'handgun',
				dmgMin: 5,
				dmgMax: 9,
				clipSize: 6,
				rof: 1200,
				reload: 4000
			}
		],
		consumables: [
			{
				name: 'Medkit',
				isLarge: true,
				target: ['character'],
				use: function (character, target) {
					console.log('Healing!');
					console.log(target);
				}
			}
		]
	});
});

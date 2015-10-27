'use strict';

angular.module('ZombieLabApp')

.run(function (characterService) {
	characterService.archetypes = {
		warrior: {
			weapon: {
				10: 'L131A1',
				20: 'M1911',
				50: 'AK47' // breakpoints
			},
			skills: {
				weapons: 75,
				hacking: 5,
				explosives: 15,
				firstAid: 5
			},
			equipment: {
				30: 'L131A1',
				20: 'Knife'
			}
		},
		medic: {
			weapon: {
				15: 'SW1905',
				20: 'L131A1',
				40: 'M1911'
			},
			skills: {
				weapons: 35,
				hacking: 15,
				explosives: 0,
				firstAid: 50
			},
			equipment: {
				30: 'Medkit',
				15: 'Bandage'
			}
		},
		grenadier: {
			weapon: {
				10: 'L131A1',
				15: 'M1911',
				30: 'SPAS12'
			},
			skills: {
				weapons: 35,
				hacking: 10,
				explosives: 50,
				firstAid: 0
			},
			equipment: {
				30: 'C4',
				15: 'Grenade'
			}
		},
		hacker: {
			weapon: {
				10: 'SW1905',
				20: 'L131A1',
				40: 'M1911'
			},
			skills: {
				weapons: 25,
				hacking: 55,
				explosives: 5,
				firstAid: 15
			},
			equipment: {
				5: 'Flashlight',
				10: 'Terminal'
			}
		}
	}
});
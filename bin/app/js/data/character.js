'use strict';

angular.module('ZombieLabApp')

.run(function (characterService) {
	characterService.archetypes = {
		warrior: {
			weapon: {
				10: 'L131A1',
				20: 'M608',
				50: 'M4' // breakpoints
			},
			skills: {
				weapons: 75,
				hacking: 5,
				explosives: 10,
				mechanic: 5,
				firstAid: 5
			},
			equipment: {
				30: 'L131A1',
				20: 'grenade'
			}
		},
		medic: {
			weapon: {
				15: 'M1911',
				20: 'L131A1',
				40: 'M608'
			},
			skills: {
				weapons: 35,
				hacking: 10,
				explosives: 0,
				mechanic: 5,
				firstAid: 50
			},
			equipment: {
				30: 'medkit',
				15: 'bandage'
			}
		},
		grenadier: {
			weapon: {
				10: 'M1911',
				15: 'L131A1',
				30: 'M608'
			},
			skills: {
				weapons: 35,
				hacking: 5,
				explosives: 45,
				mechanic: 15,
				firstAid: 0
			},
			equipment: {
				30: 'c4',
				15: 'grenade'
			}
		},
		hacker: {
			weapon: {
				10: 'M1911',
				20: 'L131A1',
				40: 'M608'
			},
			skills: {
				weapons: 25,
				hacking: 50,
				explosives: 5,
				mechanic: 15,
				firstAid: 5
			},
			equipment: {
				10: 'terminal'
			}
		}
	}
});
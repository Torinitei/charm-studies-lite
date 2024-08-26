// let me be clear when i say this changes
import { findCharmInGallery } from "./charmgallery.js";

$(function () {

	// localStorage save format versioning
	const saveVersion = '2024.08.06';

	const touchSupport = true;

	// experience constants
	const expCalcConstant = 0.1;
	const expCalcPower = 2;
	const expCalcBase = 400;
	const expCalcPrestigeFactor = 0.01;


	let PuzzleModel = Backbone.Model.extend({

		defaults: function () {
			return {
				dimensionWidth: 10, // default dimension width
				dimensionHeight: 10, // default dimension height
				state: [],
				hintsX: [],
				hintsY: [],
				guessed: 0,
				total: 100,
				complete: false,
				perfect: false,
				seed: 0,
				darkMode: false,
				easyMode: true,
				// stats update
				perfectStreak: 0,
				charmsComplete: 0,
				charmsPerfect: 0,
				// experience update
				playerExperience: 0,
				playerExperienceBuffer: 0,
				playerPrestige: 0,
				charmExperience: 0,
				charmMaxExperience: 0,
				autoPauseMode: true,
				timerDisplayMode: true,
				charmExhaustedID: "",
				// achievements update
				// achievements: []
			}
		},

		initialize: function () {
			this.on('change', this.save);
		},

		save: function () {
			if (localStorageSupport()) {
				localStorage['picross2.saveVersion'] = saveVersion;

				localStorage['picross2.dimensionWidth'] = JSON.stringify(this.get('dimensionWidth'));
				localStorage['picross2.dimensionHeight'] = JSON.stringify(this.get('dimensionHeight'));
				localStorage['picross2.state'] = JSON.stringify(this.get('state'));
				localStorage['picross2.hintsX'] = JSON.stringify(this.get('hintsX'));
				localStorage['picross2.hintsY'] = JSON.stringify(this.get('hintsY'));
				localStorage['picross2.guessed'] = JSON.stringify(this.get('guessed'));
				localStorage['picross2.total'] = JSON.stringify(this.get('total'));
				localStorage['picross2.complete'] = JSON.stringify(this.get('complete'));
				localStorage['picross2.perfect'] = JSON.stringify(this.get('perfect'));
				localStorage['picross2.seed'] = JSON.stringify(this.get('seed'));
				localStorage['picross2.darkMode'] = JSON.stringify(this.get('darkMode'));
				localStorage['picross2.easyMode'] = JSON.stringify(this.get('easyMode'));
				// stats update
				localStorage['charmStudiesLite.stats.perfectStreak'] = JSON.stringify(this.get('perfectStreak'));
				localStorage['charmStudiesLite.stats.charmsComplete'] = JSON.stringify(this.get('charmsComplete'));
				localStorage['charmStudiesLite.stats.charmsPerfect'] = JSON.stringify(this.get('charmsPerfect'));
				// experience update
				localStorage['charmStudiesLite.stats.EXP.playerExperience'] = JSON.stringify(this.get('playerExperience'));
				localStorage['charmStudiesLite.stats.EXP.playerExperienceBuffer'] = JSON.stringify(this.get('playerExperienceBuffer'));
				localStorage['charmStudiesLite.stats.EXP.playerPrestige'] = JSON.stringify(this.get('playerPrestige'));
				localStorage['charmStudiesLite.stats.EXP.charmExperience'] = JSON.stringify(this.get('charmExperience'));
				localStorage['charmStudiesLite.stats.EXP.charmMaxExperience'] = JSON.stringify(this.get('charmMaxExperience'));
				localStorage['charmStudiesLite.timer.autoPauseMode'] = JSON.stringify(this.get('autoPauseMode'));
				localStorage['charmStudiesLite.timer.timerDisplayMode'] = JSON.stringify(this.get('timerDisplayMode'));
				localStorage['charmStudiesLite.stats.EXP.charmExhaustedID'] = JSON.stringify(this.get('charmExhaustedID'));
				// achievements update
				// this.updateAchievementList();
				// localStorage['charmStudiesLite.achievements'] = JSON.stringify(this.get('achievements'));
			}
		},

		resume: function () {

			if (!localStorageSupport() || localStorage['picross2.saveVersion'] != saveVersion) {
				this.reset();
				return;
			}

			let defaults = this.defaults()

			function safeLocalStorage(saveKey) {
				if (localStorage[saveKey] != 'undefined' && localStorage[saveKey] !== undefined) {
					return localStorage[saveKey];
				}
				defaultKey = (saveKey.split(".")).at(-1);
				newKey = JSON.stringify(defaults[defaultKey])
				return newKey;
			}

			const dimensionWidth = JSON.parse(safeLocalStorage('picross2.dimensionWidth'));
			const dimensionHeight = JSON.parse(safeLocalStorage('picross2.dimensionHeight'));
			const state = JSON.parse(safeLocalStorage('picross2.state'));
			const hintsX = JSON.parse(safeLocalStorage('picross2.hintsX'));
			const hintsY = JSON.parse(safeLocalStorage('picross2.hintsY'));
			const guessed = JSON.parse(safeLocalStorage('picross2.guessed'));
			const total = JSON.parse(safeLocalStorage('picross2.total'));
			const complete = JSON.parse(safeLocalStorage('picross2.complete'));
			const perfect = JSON.parse(safeLocalStorage('picross2.perfect'));
			const seed = JSON.parse(safeLocalStorage('picross2.seed'));
			const darkMode = JSON.parse(safeLocalStorage('picross2.darkMode'));
			const easyMode = JSON.parse(safeLocalStorage('picross2.easyMode'));
			// stats update
			const perfectStreak = JSON.parse(safeLocalStorage('charmStudiesLite.stats.perfectStreak'));
			const charmsComplete = JSON.parse(safeLocalStorage('charmStudiesLite.stats.charmsComplete'));
			const charmsPerfect = JSON.parse(safeLocalStorage('charmStudiesLite.stats.charmsPerfect'));
			// experience update
			const playerExperience = JSON.parse(safeLocalStorage('charmStudiesLite.stats.EXP.playerExperience'));
			const playerExperienceBuffer = JSON.parse(safeLocalStorage('charmStudiesLite.stats.EXP.playerExperienceBuffer'));
			const playerPrestige = JSON.parse(safeLocalStorage('charmStudiesLite.stats.EXP.playerPrestige'));
			const charmExperience = JSON.parse(safeLocalStorage('charmStudiesLite.stats.EXP.charmExperience'));
			const charmMaxExperience = JSON.parse(safeLocalStorage('charmStudiesLite.stats.EXP.charmMaxExperience'));
			const autoPauseMode = JSON.parse(safeLocalStorage('charmStudiesLite.timer.autoPauseMode'));
			const timerDisplayMode = JSON.parse(safeLocalStorage('charmStudiesLite.timer.timerDisplayMode'));
			const charmExhaustedID = JSON.parse(safeLocalStorage('charmStudiesLite.stats.EXP.charmExhaustedID'));
			// achievements update
			// const achievements = JSON.parse(safeLocalStorage('charmStudiesLite.achievements'));


			this.set({
				dimensionWidth: dimensionWidth,
				dimensionHeight: dimensionHeight,
				state: state,
				hintsX: hintsX,
				hintsY: hintsY,
				guessed: guessed,
				total: total,
				complete: complete,
				perfect: perfect,
				seed: seed,
				easyMode: easyMode,
				darkMode: darkMode,
				// stats update
				perfectStreak: perfectStreak,
				charmsComplete: charmsComplete,
				charmsPerfect: charmsPerfect,
				// experience update
				playerExperience: playerExperience,
				playerExperienceBuffer: playerExperienceBuffer,
				playerPrestige: playerPrestige,
				charmExperience: charmExperience,
				charmMaxExperience: charmMaxExperience,
				autoPauseMode: autoPauseMode,
				timerDisplayMode: timerDisplayMode,
				charmExhaustedID: charmExhaustedID,
				// achievements: achievements
			});
		},

		/* getDefaultAchievements: function () {
			return [{
					id: "achv-Welcome",
					progress: "N/A",
					completed: false
				},
				{
					id: "achv-SweetTreat",
					progress: "N/A",
					completed: false
				},
				{
					id: "achv-CharmsPerfect1",
					progress: 0,
					completed: false
				}
			]
		}, */

		/* getAchievementRequirements: function () {
			return [{
					id: "achv-Welcome",
					types: ["automatic", "no-progressing"],
					requirements: "... you're here, isn't that enough already-"
				},
				{
					id: "achv-SweetTreat",
					types: ["easter-egg", "no-progressing"],
					requirements: "Have a sweet tooth :3"
				},
				{
					id: "achv-CharmsPerfect1",
					types: ["charms-perfect"],
					requirements: 5
				}
			]
		}, */
		
		/* checkAchievementCompletion: function () {
			this.updateAchievementList();
			let achievements = this.get('achievements');
			let achievementRequirements = this.getAchievementRequirements();
			achievements.forEach((achievement) => {
				if (achievement.completed) { return; }

				let requirement = achievementRequirements.find(req => req.id === achievement.id);
				let checkStat;

				if (requirement.types.includes("automatic")) {
					achievement.completed = true;
					return;
				} else if (requirement.types.includes("charms-perfect")) {
					checkStat = this.get("charmsPerfect")
					achievement.progress = checkStat;
					if (checkStat >= requirement.requirements) {
						achievement.completed = true;
					}
				}
			})
			this.trigger('change');
		}, */

		/* updateAchievementList: function () {
			let achievements = this.get('achievements');
			let defaultAchievements = this.getDefaultAchievements();

			if (achievements.length == defaultAchievements.length) {
				return;
			}

			defaultAchievements.forEach((element) => {
				if (!achievements.includes(element)) {
					achievements.push(element);
				}
			});

			this.set({
				achievements: achievements
			}, {
				silent: true
			});
			this.trigger('change');
		}, */

		reset: function (customSeed) {
			
			let seed = customSeed;
			if (seed === undefined) {
				seed = '' + new Date().getTime();
			}
			Math.seedrandom(seed);

			let solution = [];
			let state = [];
			let total = 0;

			// charm gallery generator
			// failed to separate this into another function (cries)
			let originalCharms = [
				/* NomNomNami - Charm Studies Originals */
				// 5x5
				"Astral Magic",
				"Temporal Magic",
				"Spatial Magic",
				"Sweets!",
				"Love <3",
				// 10x10
				"Connection Magic",
				"Illusion Magic",
				"Growth Magic",
				"Kitty~",
				"Charm Book",
				"Cute Staff",
				"Charm Studies", // game logo
				// 15x15
				"Magic Circle",
				"Broomstick",
				"Senna <3",
				"Me!",
				/* NomNomNami - Other characters/works */
				/* BAD END THEATER */
				"HERO",
				"MAIDEN",
				"UNDERLING",
				"OVERLORD",
				"TRAGEDY",
				/* Starry Flowers */
				"Starry Flowers",
				"Pastille",
				"Periwinkle",
				"Astragalus",
				/* Contract Demon */
				"Kamila",
				"Eleni",
				/* Astra's Garden */
				"Vinegar",
				"Cassava",
				/* Syrup and the Ultimate Sweet */
				"Syrup",
				"Gumdrop",
				"Butterscotch",
				"Toffee",
				/* Indie Crossovers */
				/* In Stars and Time */
				"Siffrin",
				"Mirabelle",
				"Isabeau",
				"Odile",
				"Bonnie",
				/* OMORI */
				"SUNNY",
				"AUBREY",
				"KEL",
				"OMORI/HERO",
				"BASIL",
				"MARI",
				"OMORI",
				/* Special */
				"Sif24"
			];

			let inCharmGallery = originalCharms.includes(seed);
			if (inCharmGallery) {
				[state, solution, total] = findCharmInGallery(seed);
			} else {
				for (let i = 0; i < this.get('dimensionHeight'); i++) {
					solution[i] = [];
					state[i] = [];
					for (let j = 0; j < this.get('dimensionWidth'); j++) {
						let random = Math.ceil(Math.random() * 2);
						solution[i][j] = random;
						total += (random - 1);
						state[i][j] = 0;
					}
				}
			}

			/* use in console whenever testing charm playability
let allhintsX = "";
for (let group in eval(localStorage['picross2.hintsX'])) {
	allhintsX += eval(localStorage['picross2.hintsX'])[group].map(Math.abs) + "\n"
}
console.log(allhintsX)
console.log(localStorage['picross2.seed'])
let allhintsY = "";
for (let group in eval(localStorage['picross2.hintsY'])) {
	allhintsY += eval(localStorage['picross2.hintsY'])[group].map(Math.abs) + "\n"
}
console.log(allhintsY)
			*/

			let hintsX = this.getHintsX(solution);
			let hintsY = this.getHintsY(solution);
			// state = solution; // DEV TEST

			this.set({
				state: state,
				hintsX: hintsX,
				hintsY: hintsY,
				guessed: 0, // total, // DEV TEST
				total: total,
				complete: false,
				perfect: false,
				seed: seed
			}, {
				silent: true
			});
			this.trigger('change');
		},

		getHintsX: function (solution) {
			let hintsX = [];

			for (let i = 0; i < this.get('dimensionHeight'); i++) {
				let streak = 0;
				hintsX[i] = [];
				for (let j = 0; j < this.get('dimensionWidth'); j++) {
					if (solution[i][j] < 2) {
						if (streak > 0) {
							hintsX[i].push(streak);
						}
						streak = 0;
					} else {
						streak++;
					}
				}
				if (streak > 0) {
					hintsX[i].push(streak);
				}
			}

			return hintsX;
		},

		getHintsY: function (solution) {
			let hintsY = [];

			for (let j = 0; j < this.get('dimensionWidth'); j++) {
				let streak = 0;
				hintsY[j] = [];
				for (let i = 0; i < this.get('dimensionHeight'); i++) {
					if (solution[i][j] < 2) {
						if (streak > 0) {
							hintsY[j].push(streak);
						}
						streak = 0;
					} else {
						streak++;
					}
				}
				if (streak > 0) {
					hintsY[j].push(streak);
				}
			}

			return hintsY;
		},

		guess: function (x, y, guess) {
			let state = this.get('state');
			let guessed = this.get('guessed');

			if (state[x][y] === 2) {
				guessed--;
			}

			if (state[x][y] === guess) {
				state[x][y] = 0;
			} else {
				state[x][y] = guess;
				if (guess === 2) {
					guessed++;
				}
			}

			this.set({
				state: state,
				guessed: guessed
			}, {
				silent: true
			});

			this.updateCrossouts(state, x, y);
		},

		updateCrossouts: function (state, x, y) {
			let hintsX = this.get('hintsX');
			let hintsY = this.get('hintsY');

			// cross out row hints
			let filled = true;
			let cellIndex = 0;
			let hintIndex = 0;
			for (cellIndex; cellIndex < state[x].length;) {
				if (state[x][cellIndex] === 2) {
					if (hintIndex < hintsX[x].length) {
						for (let i = 0; i < Math.abs(hintsX[x][hintIndex]); i++) {
							if (state[x][cellIndex] === 2) {
								cellIndex++;
							} else {
								filled = false;
								break;
							}
						}
						if (state[x][cellIndex] === 2) {
							filled = false;
							break;
						}
						hintIndex++;
					} else {
						filled = false;
						break;
					}
				} else {
					cellIndex++;
				}
			}
			if (cellIndex < state[x].length || hintIndex < hintsX[x].length) {
				filled = false;
			}
			for (let i = 0; i < hintsX[x].length; i++) {
				hintsX[x][i] = Math.abs(hintsX[x][i]) * (filled ? -1 : 1);
			}

			// cross out column hints
			filled = true;
			cellIndex = 0;
			hintIndex = 0;
			for (cellIndex; cellIndex < state.length;) {
				if (state[cellIndex][y] === 2) {
					if (hintIndex < hintsY[y].length) {
						for (let i = 0; i < Math.abs(hintsY[y][hintIndex]); i++) {
							if (cellIndex < state.length && state[cellIndex][y] === 2) {
								cellIndex++;
							} else {
								filled = false;
								break;
							}
						}
						if (cellIndex < state.length && state[cellIndex][y] === 2) {
							filled = false;
							break;
						}
						hintIndex++;
					} else {
						filled = false;
						break;
					}
				} else {
					cellIndex++;
				}
			}
			if (cellIndex < state.length || hintIndex < hintsY[y].length) {
				filled = false;
			}
			for (let i = 0; i < hintsY[y].length; i++) {
				hintsY[y][i] = Math.abs(hintsY[y][i]) * (filled ? -1 : 1);
			}

			this.set({
				hintsX: hintsX,
				hintsY: hintsY
			}, {
				silent: true
			});
			this.trigger('change');
		},

		isPerfect: function () {
			let perfect = true;
			let state = this.get('state');

			// convert marks to crossses
			let markedCells = [];
			for (let y = 0; y < state.length; y++) {
				for (let x = 0; x < state[y].length; x++) {
					if (state[y][x] == 9) {
						state[y][x] = 1;
						markedCells.push([y, x]);
					}
				}
			}

			let hintsX = this.get('hintsX');
			let hintsY = this.get('hintsY');
			let solutionX = this.getHintsX(state);
			let solutionY = this.getHintsY(state);

			for (let i = 0; i < hintsX.length; i++) {
				if (hintsX[i].length !== solutionX[i].length) {
					perfect = false;
					break;
				}
				for (let j = 0; j < hintsX[i].length; j++) {
					if (Math.abs(hintsX[i][j]) !== solutionX[i][j]) {
						perfect = false;
						break;
					}
				}
			}

			for (let i = 0; i < hintsY.length; i++) {
				if (hintsY[i].length !== solutionY[i].length) {
					perfect = false;
					break;
				}
				for (let j = 0; j < hintsY[i].length; j++) {
					if (Math.abs(hintsY[i][j]) !== solutionY[i][j]) {
						perfect = false;
						break;
					}
				}
			}

			// reverting marked cells if not perfect
			if (!perfect) {
				markedCells.forEach(([y, x]) => state[y][x] = 9);
			}

			return perfect;
		}

	});

	let PuzzleView = Backbone.View.extend({

		el: $("body"),

		events: function () {
			if (touchSupport && 'ontouchstart' in document.documentElement) {
				return {
					"change #autoPause": "changeAutoPauseMode",
					"change #dark": "changeDarkMode",
					"change #easy": "changeEasyMode",
					"change #showTimer": "changeTimerDisplayMode",
					// "click #achievements": "renderAchievements",
					"click #customSeed": function (e) {
						e.currentTarget.select();
					},
					"click #galleryStudy": "galleryStudy",
					"click #new": "newGame",
					"click #prestigeExperience": "prestigeExperience",
					"click #seed": function (e) {
						e.currentTarget.select();
					},
					"click #solve": "solve",
					"click #statReset": "statReset",
					"contextmenu": function (e) {
						e.preventDefault();
					},
					// "click #theCookieOfAllTime": "sweetTreat",
					// "click #updateAchievements": "renderAchievements",
					"mousedown": "clickStart",
					"mouseout td.cell": "mouseOut",
					"mouseover td.cell": "mouseOver",
					"mouseup": "clickEnd",
					"submit #customForm": "newCustom",
					"touchend td.cell": "touchEnd",
					"touchmove td.cell": "touchMove",
					"touchstart td.cell": "touchStart",
				}
			} else {
				return {
					"change #autoPause": "changeAutoPauseMode",
					"change #dark": "changeDarkMode",
					"change #easy": "changeEasyMode",
					"change #showTimer": "changeTimerDisplayMode",
					// "click #achievements": "renderAchievements",
					"click #customSeed": function (e) {
						e.currentTarget.select();
					},
					"click #galleryStudy": "galleryStudy",
					"click #new": "newGame",
					"click #prestigeExperience": "prestigeExperience",
					"click #seed": function (e) {
						e.currentTarget.select();
					},
					"click #solve": "solve",
					"click #statReset": "statReset",
					"contextmenu": function (e) {
						e.preventDefault();
					},
					// "click #theCookieOfAllTime": "sweetTreat",
					// "click #updateAchievements": "renderAchievements",
					"mousedown": "clickStart",
					"mouseout td.cell": "mouseOut",
					"mouseover td.cell": "mouseOver",
					"mouseup": "clickEnd",
					"submit #customForm": "newCustom",
				};
			}
		},

		mouseStartX: -1,
		mouseStartY: -1,
		mouseEndX: -1,
		mouseEndY: -1,
		mouseMode: 0,

		initialize: function () {
			this.model.resume();
			$('#dimensions').val(this.model.get('dimensionWidth') + 'x' + this.model.get('dimensionHeight'));
			if (this.model.get('darkMode')) {
				$('#dark').attr('checked', 'checked');
			} else {
				$('#dark').removeAttr('checked');
			}
			if (this.model.get('easyMode')) {
				$('#easy').attr('checked', 'checked');
			} else {
				$('#easy').removeAttr('checked');
			}
			if (this.model.get('timerDisplayMode')) {
				$('#showTimer').attr('checked', 'checked');
			} else {
				$('#showTimer').removeAttr('checked');
			}
			if (this.model.get('autoPauseMode')) {
				$('#autoPause').attr('checked', 'checked');
			} else {
				$('#autoPause').removeAttr('checked');
			}
			this.render();
			this.showSeed();
		},

		changeDarkMode: function () {
			let darkMode = $('#dark').attr('checked') !== undefined;
			this.model.set({
				darkMode: darkMode
			});
			this.render();
		},

		changeEasyMode: function () {
			let easyMode = $('#easy').attr('checked') !== undefined;
			this.model.set({
				easyMode: easyMode
			});
			this.render();
		},

		changeTimerDisplayMode: function () {
			let timerDisplayMode = $('#showTimer').attr('checked') !== undefined;
			this.model.set({
				timerDisplayMode: timerDisplayMode
			});
			this.render();
		},

		changeAutoPauseMode: function () {
			let autoPauseMode = $('autoPause').attr('checked') !== undefined;
			this.model.set({
				autoPauseMode: autoPauseMode
			});
			this.render();
		},

		changeDimensions: function (e) {
			let ogDim = $('#dimensions').val();
			let dimSelect = document.getElementById("dimensions");
			// charm gallery resizer
			switch (e) {
				default:
					break;
					/* NomNomNami - Charm Studies Originals */
					// 5x5
				case "Astral Magic":
				case "Temporal Magic":
				case "Spatial Magic":
				case "Sweets!":
				case "Love <3":
					dimSelect.value = "5x5";
					break;
					// 10x10
				case "Connection Magic":
				case "Illusion Magic":
				case "Growth Magic":
				case "Kitty~":
				case "Charm Book":
				case "Cute Staff":
				case "Charm Studies": // game logo
					dimSelect.value = "10x10";
					break;
					// 15x15
				case "Magic Circle":
				case "Broomstick":
				case "Senna <3":
				case "Me!":
					dimSelect.value = "15x15";
					break;
					/* NomNomNami - Other characters/works */
					/* BAD END THEATER */
				case "HERO":
				case "MAIDEN":
				case "UNDERLING":
				case "TRAGEDY":
				case "OVERLORD":
					/* Starry Flowers */
				case "Starry Flowers":
				case "Pastille":
				case "Periwinkle":
				case "Astragalus":
					/* Contract Demon */
				case "Kamila":
				case "Eleni":
					/* Astra's Garden */
				case "Vinegar":
				case "Cassava":
					/* Syrup and the Ultimate Sweet */
				case "Syrup":
				case "Gumdrop":
				case "Butterscotch":
				case "Toffee":
					/* Indie Crossovers */
					/* In Stars and Time */
				case "Siffrin":
				case "Mirabelle":
				case "Isabeau":
				case "Odile":
				case "Bonnie":
					/* OMORI */
				case "SUNNY":
				case "AUBREY":
				case "KEL":
				case "OMORI/HERO":
				case "BASIL":
				case "MARI":
				case "OMORI":
					/* Special */
				case "Sif24":
					dimSelect.value = "30x30";
			}
			let dimensions = $('#dimensions').val();
			dimensions = dimensions.split('x');
			this.model.set({
				dimensionWidth: dimensions[0],
				dimensionHeight: dimensions[1]
			});
			dimSelect.value = ogDim;
		},

		galleryStudy: function (e) {
			e.preventDefault();

			let selectedCharm = document.getElementById("original-charms").value;
			if (selectedCharm !== "default") {
				this._newGame(selectedCharm);
				document.getElementById("original-charms").value = "default";
			}
		},

		statReset: function (e) {
			e.preventDefault();

			this.model.set({
				// stat update
				perfectStreak: 0,
				charmsComplete: 0,
				charmsPerfect: 0,
				playerExperience: 0,
				playerExperienceBuffer: 0,
				playerPrestige: 0,
			});
			this.render();
		},

		_newGame: function (customSeed) {
			if (!this.model.isPerfect()) {
				this.storeExperience();
			}
			$('#solve').prop('disabled', false);
			$('#solve').text('Finish Charm!');
			$('#puzzle').removeClass('complete');
			$('#puzzle').removeClass('perfect');
			$('#progress').removeClass('done');
			this.changeDimensions(customSeed);
			this.model.reset(customSeed);
			this.calculateMaxExperience();
			this.render();
			this.showSeed();
		},

		newGame: function () {
			$('#customSeed').val('');
			this._newGame();
		},

		newCustom: function (e) {
			e.preventDefault();

			let customSeed = $.trim($('#customSeed').val());
			if (customSeed.length) {
				this._newGame(customSeed);
			} else {
				this._newGame();
			}
		},

		showSeed: function () {
			let seed = this.model.get('seed');
			$('#seed').val(seed);
		},

		clickStart: function (e) {
			if (this.model.get('complete')) {
				return;
			}

			let target = $(e.target);

			if (this.mouseMode != 0 || target.attr('data-x') === undefined || target.attr('data-y') === undefined) {
				this.mouseMode = 0;
				this.render();
				return;
			}

			this.mouseStartX = target.attr('data-x');
			this.mouseStartY = target.attr('data-y');
			switch (e.which) {
				case 1:
					// left click
					e.preventDefault();
					this.mouseMode = 1;
					break;
				case 2:
					// middle click
					e.preventDefault();
					this.mouseMode = 2;
					break;
				case 3:
					// right click
					e.preventDefault();
					this.mouseMode = 3;
					break;
			}
		},

		mouseOver: function (e) {
			let target = $(e.currentTarget);
			let endX = target.attr('data-x');
			let endY = target.attr('data-y');
			this.mouseEndX = endX;
			this.mouseEndY = endY;

			$('td.hover').removeClass('hover');
			$('td.hoverLight').removeClass('hoverLight');

			if (this.mouseMode === 0) {
				$('td.cell[data-y=' + endY + ']').addClass('hoverLight');
				$('td.cell[data-x=' + endX + ']').addClass('hoverLight');
				$('td.cell[data-x=' + endX + '][data-y=' + endY + ']').addClass('hover');
				return;
			}

			let startX = this.mouseStartX;
			let startY = this.mouseStartY;

			if (startX === -1 || startY === -1) {
				return;
			}

			let diffX = Math.abs(endX - startX);
			let diffY = Math.abs(endY - startY);

			if (diffX > diffY) {
				$('td.cell[data-x=' + endX + ']').addClass('hoverLight');
				let start = Math.min(startX, endX);
				let end = Math.max(startX, endX);
				for (let i = start; i <= end; i++) {
					$('td.cell[data-x=' + i + '][data-y=' + startY + ']').addClass('hover');
					$('td.cell[data-x=' + i + '][data-y=' + startY + ']').text(diffX + 1);
					if ($('td.cell[data-x=' + i + '][data-y=' + startY + ']').hasClass('s1')) {
						$('td.cell[data-x=' + i + '][data-y=' + startY + ']').addClass('hidden-content').css("color", "#ffb6c8");
					}
				}
			} else {
				$('td.cell[data-y=' + endY + ']').addClass('hoverLight');
				let start = Math.min(startY, endY);
				let end = Math.max(startY, endY);
				for (let i = start; i <= end; i++) {
					$('td.cell[data-x=' + startX + '][data-y=' + i + ']').addClass('hover');
					$('td.cell[data-x=' + startX + '][data-y=' + i + ']').text(diffY + 1);
					if ($('td.cell[data-x=' + startX + '][data-y=' + i + ']').hasClass('s1')) {
						$('td.cell[data-x=' + startX + '][data-y=' + i + ']').addClass('hidden-content').css("color", "#ffb6c8");
					}
				}
			}
		},

		mouseOut: function () {
			if (this.mouseMode === 0) {
				$('td.hover').removeClass('hover');
				$('td.hoverLight').removeClass('hoverLight');
			}

			let startX = this.mouseStartX;
			let startY = this.mouseStartY;
			let endX = this.mouseEndX;
			let endY = this.mouseEndY;

			let diffX = Math.abs(endX - startX);
			let diffY = Math.abs(endY - startY);

			if (diffX > diffY) {
				$('td.cell[data-x=' + endX + '][data-y=' + startY + ']').remove('hidden-content');
				$('td.cell[data-x=' + endX + '][data-y=' + startY + ']').text('');
				if ($('td.cell[data-x=' + endX + '][data-y=' + startY + ']').hasClass('hidden-content')) {
					$('td.cell[data-x=' + endX + '][data-y=' + startY + ']').removeClass('hidden-content');
				}
			} else {
				$('td.cell[data-x=' + startX + '][data-y=' + endY + ']').remove('hidden-content');
				$('td.cell[data-x=' + startX + '][data-y=' + endY + ']').text('');
				if ($('td.cell[data-x=' + startX + '][data-y=' + endY + ']').hasClass('hidden-content')) {
					$('td.cell[data-x=' + startX + '][data-y=' + endY + ']').removeClass('hidden-content');
				}
			}
		},

		clickEnd: function (e) {
			if (this.model.get('complete')) {
				return;
			}

			let target = $(e.target);
			switch (e.which) {
				case 1:
					// left click
					e.preventDefault();
					if (this.mouseMode != 1) {
						this.mouseMode = 0;
						return;
					}
					if (target.attr('data-x') === undefined || target.attr('data-y') === undefined) {
						this.clickArea(this.mouseEndX, this.mouseEndY, 2);
					} else {
						this.clickArea(target.attr('data-x'), target.attr('data-y'), 2);
					}
					break;
				case 2:
					// middle click
					if (this.mouseMode != 2) {
						this.mouseMode = 0;
						return;
					}
					if (target.attr('data-x') === undefined || target.attr('data-y') === undefined) {
						this.clickArea(this.mouseEndX, this.mouseEndY, 9);
					} else {
						this.clickArea(target.attr('data-x'), target.attr('data-y'), 9);
					}
					break;
				case 3:
					// right click
					e.preventDefault();
					if (this.mouseMode != 3) {
						this.mouseMode = 0;
						return;
					}
					if (target.attr('data-x') === undefined || target.attr('data-y') === undefined) {
						this.clickArea(this.mouseEndX, this.mouseEndY, 1);
					} else {
						this.clickArea(target.attr('data-x'), target.attr('data-y'), 1);
					}
					break;
			}
			this.mouseMode = 0;
			this.render();
			this.checkCompletion();
		},

		checkCompletion: function () {
			if (this.model.isPerfect()) {
				this.solve();
			}
		},

		clickArea: function (endX, endY, guess) {
			let startX = this.mouseStartX;
			let startY = this.mouseStartY;

			if (startX === -1 || startY === -1) {
				return;
			}

			let diffX = Math.abs(endX - startX);
			let diffY = Math.abs(endY - startY);

			if (diffX > diffY) {
				for (let i = Math.min(startX, endX); i <= Math.max(startX, endX); i++) {
					this.model.guess(i, startY, guess);
				}
			} else {
				for (let i = Math.min(startY, endY); i <= Math.max(startY, endY); i++) {
					this.model.guess(startX, i, guess);
				}
			}
		},

		touchStart: function (e) {
			if (this.model.get('complete')) {
				return;
			}
			let target = $(e.target);
			this.mouseStartX = this.mouseEndX = e.originalEvent.touches[0].pageX;
			this.mouseStartY = this.mouseEndY = e.originalEvent.touches[0].pageY;
			let that = this;
			this.mouseMode = setTimeout(function () {
				that.model.guess(target.attr('data-x'), target.attr('data-y'), 1);
				that.render();
			}, 750);
		},

		touchMove: function (e) {
			if (this.model.get('complete')) {
				return;
			}
			this.mouseEndX = e.originalEvent.touches[0].pageX;
			this.mouseEndY = e.originalEvent.touches[0].pageY;
			if (Math.abs(this.mouseEndX - this.mouseStartX) >= 10 || Math.abs(this.mouseEndY - this.mouseStartY) >= 10) {
				clearTimeout(this.mouseMode);
			}
		},

		touchEnd: function (e) {
			if (this.model.get('complete')) {
				return;
			}
			clearTimeout(this.mouseMode);
			let target = $(e.target);
			if (Math.abs(this.mouseEndX - this.mouseStartX) < 10 && Math.abs(this.mouseEndY - this.mouseStartY) < 10) {
				this.model.guess(target.attr('data-x'), target.attr('data-y'), 2);
				this.render();
				this.checkCompletion();
			}
		},

		round25: function (num) {
			return Math.round(num / 25) * 25;
		},

		calculateMaxExperience: function () {
			let charmWidth = Number(this.model.get('dimensionWidth'));
			let charmHeight = Number(this.model.get('dimensionHeight'));
			let dimensionAdjust = (((charmWidth + charmHeight) / 2) ** 2).toFixed(0); // exp multi based off size
			let total = this.model.get('total');

			let hintsX = this.model.get('hintsX');
			let hintsY = this.model.get('hintsY');

			let totalComplexity = 0; // exp multi based off below
			let sparseBias = 0; // give bonus to charms with few cells compared to more populated ones
			let separationMulti; // consider rows/columns that have more than one hint number more complex
			let pascalBias; // pascal's triangle - consider rows/columns that have the highest nCr to be most complex

			for (let i = 0; i < hintsX.length; i++) {
				pascalBias = 0;
				separationMulti = 0;

				let rowSum = hintsX[i].reduce((partialSum, a) => partialSum + a + 1, -1);
				let rowMedian = Math.ceil(charmWidth / 2);
				let rowSpaceDifference = Math.abs(rowSum - rowMedian);

				if (rowSpaceDifference != 0 && rowSum > 0) { // check if not highest possibilities (nCr), if rowSum 0, no xp awarded
					pascalBias = 1 + Math.abs(1 / (rowSum - rowMedian));
				} else {
					pascalBias = 2.5;
				}

				separationMulti = 1 + 1 / 2 * (hintsX[i].length - 1);

				totalComplexity += pascalBias * separationMulti;
			}

			for (let i = 0; i < hintsY.length; i++) {
				pascalBias = 0;
				separationMulti = 0;

				let columnSum = hintsY[i].reduce((partialSum, a) => partialSum + a + 1, -1);
				let columnMedian = Math.ceil(charmHeight / 2);
				let columnSpaceDifference = Math.abs(columnSum - columnMedian);

				if (columnSpaceDifference != 0 && columnSum > 0) { // check if not highest possibilities (nCr), if columnSum 0, no xp awarded
					pascalBias = 1 + Math.abs(1 / (columnSum - columnMedian));
				} else {
					pascalBias = 2.5;
				}

				separationMulti = 1 + 1 / 2 * (hintsY[i].length - 1);


				totalComplexity += pascalBias * separationMulti;
			}

			let triangle = (charmWidth * charmHeight / 2); // stupid name but i love it too much to not keep it
			// triangle area = 1/2 bh

			if (triangle > total) {
				sparseBias = 1 + 0.01 * Math.abs(total - triangle);
			} else {
				sparseBias = 1 + 0.005 * Math.abs(total - triangle);
			}

			let formulaXP = dimensionAdjust * totalComplexity * sparseBias;
			if (this.model.get('seed') == this.model.get('charmExhaustedID')) { // disincentivise repeating charms in a row
				formulaXP /= 4;
			}
			let maxXP = this.round25(formulaXP); // round to nearest 25 because aesthetic idk

			this.model.set({
				charmMaxExperience: maxXP
			});

			this.calculateExperience();
		},

		calculateExperience: function () {
			let state = this.model.get('state');

			let progress = this.model.get('guessed') / this.model.get('total') * 100;
			if (progress > 100) { // punish over 100% progress
				progress = 10;
			}
			progress = progress / 100;

			let maxXP = this.model.get('charmMaxExperience');
			if (!maxXP) { // solves (clear storage fix?)
				this.calculateMaxExperience();
				maxXP = this.model.get('charmMaxExperience');
			}

			// convert marks to crossses
			let markedCells = [];
			for (let y = 0; y < state.length; y++) {
				for (let x = 0; x < state[y].length; x++) {
					if (state[y][x] == 9) {
						state[y][x] = 1;
						markedCells.push([y, x]);
					}
				}
			}

			let hintsX = this.model.get('hintsX');
			let hintsY = this.model.get('hintsY');
			let solutionX = this.model.getHintsX(state);
			let solutionY = this.model.getHintsY(state);

			let allRuns = 0,
				incorrectRuns = 0;

			// accuracy will be determined by imperfection finding

			for (let i = 0; i < hintsX.length; i++) {
				if (hintsX[i].length == 0) {
					continue;
				}
				allRuns++;
				if (hintsX[i].length !== solutionX[i].length) {
					incorrectRuns++;
					continue;
				}
				for (let j = 0; j < hintsX[i].length; j++) {
					if (Math.abs(hintsX[i][j]) !== solutionX[i][j]) {
						incorrectRuns++;
						break;
					}
				}
			}

			for (let i = 0; i < hintsY.length; i++) {
				if (hintsY[i].length == 0) {
					continue;
				}
				allRuns++;
				if (hintsY[i].length !== solutionY[i].length) {
					incorrectRuns++;
					continue;
				}
				for (let j = 0; j < hintsY[i].length; j++) {
					if (Math.abs(hintsY[i][j]) !== solutionY[i][j]) {
						incorrectRuns++;
						break;
					}
				}
			}
			// reverting marked cells
			markedCells.forEach(([y, x]) => state[y][x] = 9);
			let accuracy = (allRuns - incorrectRuns) / allRuns;

			let xp = this.round25((progress * accuracy) * maxXP);
			this.model.set({
				charmExperience: xp
			});
		},

		expToLv: function (experience) {
			let playerPrestige = this.model.get('playerPrestige');

			function nthRoot(n, expression) {
				if (expression < 0 && n % 2 != 1) return NaN; // Not well defined
				return (expression < 0 ? -1 : 1) * Math.pow(Math.abs(expression), 1 / n);
			}

			let result = Math.floor(expCalcConstant * nthRoot(expCalcPower, (nthRoot((1 + (expCalcPrestigeFactor * playerPrestige)), experience) - expCalcBase))); // inverse of lvToExp (thanks maths class)
			if (Number.isNaN(result)) {
				result = 0;
			} else if (result >= 100) {
				return "MAX";
			} else if (this.lvToExp(result + 1) == experience) { // fix: achieving exact amount of xp needed when prestige > 0 would not level up
				result += 1;
			}
			return result;
		},

		nFormatter: function (num, digits = 1) {
			const lookup = [{
					value: 1,
					symbol: ""
				},
				{
					value: 1e3,
					symbol: "k"
				},
				{
					value: 1e6,
					symbol: "M"
				},
				{
					value: 1e9,
					symbol: "B"
				},
				{ // realistically who will get this far
					value: 1e12,
					symbol: "T"
				},
				{
					value: 1e15,
					symbol: "Qd"
				}, // would do more but unsafe integer past this point
				// also it would take 570 millenia by perfecting a 30x30 every two hours without stopping but uhhhhh
				// nobody tryna prestige 166 right
				//       right
			];
			const regexp = /\.0+$|(?<=\.[0-9]*[1-9])0+$/;
			const item = lookup.findLast(item => num >= item.value);
			return item ? (num / item.value).toFixed(digits).replace(regexp, "").concat(item.symbol) : "0";
		},

		lvToExp: function (level) {
			let playerPrestige = this.model.get('playerPrestige');
			let result = this.round25((expCalcBase + (level / expCalcConstant) ** expCalcPower) ** (1 + (expCalcPrestigeFactor * playerPrestige)));
			return result; // redundant
		},

		storeExperience: function () {
			let progress = this.model.get('guessed') / this.model.get('total') * 100;
			let currentXPBuffer = this.model.get('playerExperienceBuffer');
			let charmExperience = this.model.get('charmExperience');

			if (progress > 100) { // punish over 100% progress
				progress = 10;
			}
			progress = progress / 100;

			let progressAdjust = progress + 0.15; // reward players who only give up late, still punishing to players who give up early
			progressAdjust = progressAdjust > 1 ? 1 : progressAdjust; // don't allow give up bonus to exceed 100%

			let newXPbuffer = this.round25((charmExperience * progressAdjust) + currentXPBuffer);
			this.model.set({
				playerExperienceBuffer: newXPbuffer
			});
		},

		applyExperience: function () {
			this.storeExperience();
			let currentXP = this.model.get('playerExperience');
			let xpBuffer = this.model.get('playerExperienceBuffer');

			let newXP = currentXP + xpBuffer;
			this.model.set({
				playerExperience: newXP,
				playerExperienceBuffer: 0
			});

			this.styleExperience();
		},

		stylePrestige: function (nextLevelExperience) {
			let playerPrestige = this.model.get('playerPrestige');

			function romanize(num) {
				if (isNaN(num))
					return NaN;
				if (num == 0)
					return "-";
				let digits = String(+num).split(""),
					key = ["", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM",
						"", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC",
						"", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"
					],
					roman = "",
					i = 3;
				while (i--)
					roman = (key[+digits.pop() + (i * 10)] || "") + roman;
				return Array(+digits.join("") + 1).join("M") + roman;
			}


			function prestigeToTitle(prestige) {
				let prestigeTitle;
				if (prestige >= 10) {
					prestigeTitle = "Ascended";
				} else {
					const prestigeTitles = {
						0: "",
						1: "Graduate",
						2: "Professional",
						3: "Specialist",
						4: "Aficionado",
						5: "Pioneer",
						6: "Elite",
						7: "Exceptional",
						8: "Savant",
						9: "Virtuoso",
					};
					prestigeTitle = prestigeTitles[prestige];
				}

				return prestigeTitle + "";
			}


			$('#prestige').text(romanize(playerPrestige));
			$('#prestigeTitle').text(prestigeToTitle(playerPrestige));

			if (nextLevelExperience == "MAX") {
				$('#prestigeExperience').prop('disabled', false);
			} else {
				$('#prestigeExperience').prop('disabled', true);
			}
		},

		prestigeExperience: function () {
			let playerPrestige = this.model.get('playerPrestige');
			this.applyExperience();
			let currentExperience = this.model.get('playerExperience');
			let prestigedExperience = currentExperience - this.lvToExp(100);

			this.model.set({
				playerExperience: prestigedExperience,
				playerExperienceBuffer: 0,
				playerPrestige: (playerPrestige + 1),
			});

			this.styleExperience();
		},

		styleExperience: function () {
			let playerExperience = this.model.get('playerExperience');
			let level = this.expToLv(playerExperience);
			let nextLevelExperience;
			if (level == "MAX") {
				nextLevelExperience = "MAX";
			} else {
				nextLevelExperience = this.lvToExp(level + 1);
			}

			let bufferedExperience = this.model.get('playerExperienceBuffer');

			this.stylePrestige(nextLevelExperience);

			// let title = {IMPLEMENT PLEASE};

			function nFormatter(num, digits = 2) {
				const lookup = [{
						value: 1,
						symbol: ""
					},
					{
						value: 1e3,
						symbol: "k"
					},
					{
						value: 1e6,
						symbol: "M"
					},
					{
						value: 1e9,
						symbol: "B"
					},
					{
						value: 1e12,
						symbol: "T"
					},
					{
						value: 1e15,
						symbol: "Qd"
					},
				];
				const regexp = /\.0+$|(?<=\.[0-9]*[1-9])0+$/;
				const item = lookup.findLast(item => num >= item.value);
				return item ? (num / item.value).toFixed(digits).replace(regexp, "").concat(item.symbol) : "0";
			}

			function lvToTitle(level) {
				let title;
				if (level == 0) {
					title = "Clueless Cassia";
				} else if (level == "MAX") {
					title = "True Logician";
				} else {
					const perFiveLevelsTitles = {
						0: "Charms 101 Student", // beginner class
						1: "Desk Sleeper", // what cassia always ends up doing
						2: "Graduate-to-be", // in alignment with cassia's goals
						3: "Connection Capturer", // connection magic charm + cassia wants to have a connection with senna
						4: "Amateur Illusionist", // illusion magic, taught in charms II
						5: "Adept Abstractor", // abstractor is profession who analyses data, hence analysing charms to solve them
						6: "Intermediate Imbuer", // charms imbue an object with magic
						7: "Charmed Individual", // "lucky individual" + "charmed life" - senna
						8: "Concentrated Learner", // "places with a high concentration of magic" - senna
						9: "Random Resolver", // "these questions are completely random..." -  senna
						10: "Reliable Authority", // "reliable as a friend" - cassia
						11: "Diligent Tutor", // senna tutors to the best of her ability
						12: "Fluent Painter", // "fluid" - hence fluent, pillars of magic
						13: "Proficient Artist", // cassia bought into the myth that witch hair length improves proficiency
						14: "Arithmagic Ace", // senna's favourite class, see also Random Resolver
						15: "Wise Witch", // senna's favoured familiar - owls, often seen as wise
						16: "Spell Scholar", // senna wants (or rather needs) scholarships for her figwood entry
						17: "Charm Extraordinaire", // no reference
						18: "Figwood Prodigy", // figwood - top magic school for witches
						19: "Infinite Intellect", // "i do not have endless time" - infinite is synonym of endless
					};

					let lvFiveIncrement = Math.floor(level / 5);
					title = perFiveLevelsTitles[lvFiveIncrement];
				}
				return title;
			}

			playerExperience = nFormatter(playerExperience);
			if (nextLevelExperience != "MAX") {
				nextLevelExperience = nFormatter(nextLevelExperience);
			}
			bufferedExperience = nFormatter(bufferedExperience);

			let playerTitle = lvToTitle(level);

			$('#playerLevel').text(level);
			$('#currentXP').text(playerExperience);
			$('#nextXP').text(nextLevelExperience);
			$('#bufferedXP').text(bufferedExperience);
			$('#XPTitle').text(playerTitle);

			let charmXPVal = this.model.get('charmExperience');
			let charmMaxXPVal = this.model.get('charmMaxExperience');

			charmXPVal = nFormatter(charmXPVal, 1);
			charmMaxXPVal = nFormatter(charmMaxXPVal, 1);

			$('#charm-exp').text(charmXPVal);
			$('#charm-max-exp').text(charmMaxXPVal);
		},

		solve: function () {
			if (this.model.get('complete')) {
				return;
			}

			$('#solve').prop('disabled', true);
			let state = this.model.get('state');
			let hintsX = this.model.get('hintsX');
			let hintsY = this.model.get('hintsY');

			let perfect = this.model.isPerfect();

			// convert perfect empties to crossses
			for (let y = 0; y < state.length; y++) {
				for (let x = 0; x < state[y].length; x++) {
					if (state[y][x] == 0 && perfect) {
						state[y][x] = 1;
					}
				}
			}

			let charmsPerfect, perfectStreak;

			if (perfect) {
				charmsPerfect = this.model.get('charmsPerfect') + 1;
				perfectStreak = this.model.get('perfectStreak') + 1;
			} else {
				charmsPerfect = this.model.get('charmsPerfect');
				perfectStreak = 0;
			}

			let thisCharmsComplete = this.model.get('charmsComplete') + 1;

			let charmExhaustedID = this.model.get('seed');

			this.model.set({
				complete: true,
				perfect: perfect,
				hintsX: hintsX,
				hintsY: hintsY,
				perfectStreak: perfectStreak,
				charmsPerfect: charmsPerfect,
				charmsComplete: thisCharmsComplete,
				charmExhaustedID: charmExhaustedID
			});
			this.calculateExperience();
			this.applyExperience();

			this.render();
		},

		charmSum: function (hints, space, dimension) {
			let html = "";
			dimension = Number(dimension);
			if (space <= 0) {
				return;
			} // don't display sum if row/column complete

			if (space == dimension) { // full row/column can be filled, one possibility
				return '<strong class="smol full tooltip right">' + space + '<span class="tooltiptext">Can complete row/column!</span>' + '</strong>';
			}

			let isPartial = false;
			let SDDifference = dimension - space;
			hints.forEach(hint => {
				if (hint > SDDifference) {
					isPartial = true;
				}
			});

			if (isPartial) { // part of row/column can be filled, multiple possibilities
				return '<strong class="smol partial tooltip right">' + space + '<span class="tooltiptext">Can partially complete row/column.</span>' + '</strong>';
			}

			return '<strong class="smol">' + space + '</strong>';
		},

		/* sweetTreat: function () {
			let achievements = this.model.get('achievements');
			(achievements.find(achv => achv.id == "achv-SweetTreat")).completed = true;
		}, */

		/* renderAchievements: function () {
			this.model.checkAchievementCompletion();
			let achievements = this.model.get('achievements');
			let achievementRequirements = this.model.getAchievementRequirements();

			achievements.forEach((achievement) => {
				let achvElement = document.getElementById(achievement.id)
				let achvProgress = achvElement.getElementsByClassName("achievement-progress-bar")[0];
				let achvStatus = achvElement.getElementsByClassName("achievement-progress-status")[0];

				let requirement = achievementRequirements.find(req => req.id === achievement.id);
				
				if (achievement.completed) {
					achvElement.classList.add("done");
					achvStatus.innerHTML = "Done!";

					if (requirement.types.includes("no-progressing")) {
						achvProgress.setAttribute("value", "1")
						achvProgress.setAttribute("max", "1")
					} else {
						achvProgress.setAttribute("value", requirement.requirements);
						achvProgress.setAttribute("max", requirement.requirements);
					}

					return;
				}


				if (requirement.types.includes("no-progressing")) {
					achvProgress.setAttribute("value", "0")
					achvProgress.setAttribute("max", "1")
				} else {
					let progressText = achievement.progress.toString()
					let requirementText = requirement.requirements.toString()
					achvProgress.setAttribute("value", progressText);
					achvProgress.setAttribute("max", requirementText);
					achvStatus.innerHTML = `${progressText}/${requirementText}`
				}
			});
		}, */

		render: function () {
			// let achievements = this.model.get('achievements');
			let progress = this.model.get('guessed') / this.model.get('total') * 100;
			$('#progress').text(progress.toFixed(1) + '%');

			if (this.model.get('darkMode')) {
				$('body').addClass('dark');
			} else {
				$('body').removeClass('dark');
			}

			// stats update
			let perfVal = this.model.get('charmsPerfect');
			let compVal = this.model.get('charmsComplete');
			let strkVal = this.model.get('perfectStreak');
			$('#perfectStreak').text(strkVal);
			$('#perfectCharms').text(perfVal);
			$('#completeCharms').text(compVal);
			let pcRatio;
			if (compVal == 0) {
				pcRatio = 0;
			} else {
				pcRatio = 100 * perfVal / compVal;
			}
			$('#pcRatio').text(pcRatio.toFixed(1) + '%');

			// experience update
			this.calculateExperience();
			this.styleExperience();

			if (this.model.get('complete')) {
				$('#solve').prop('disabled', true);
				$('#solve').text('Not quite...');
				$('#puzzle').addClass('complete');
				if (this.model.get('perfect')) {
					$('#progress').addClass('done');
					$('#solve').text('You did it!');
					$('#puzzle').addClass('perfect');
				}
			}

			let state = this.model.get('state');
			let hintsX = this.model.get('hintsX');
			let hintsY = this.model.get('hintsY');

			let hintsXText = [];
			let hintsYText = [];

			let xSpace = 0;
			let ySpace = 0;
			let charmWidth = this.model.get('dimensionWidth');
			let charmHeight = this.model.get('dimensionHeight');

			if (this.model.get('easyMode') || this.model.get('complete')) {
				for (let i = 0; i < hintsX.length; i++) {
					hintsXText[i] = [];
					for (let j = 0; j < hintsX[i].length; j++) {
						if (hintsX[i][j] < 0) {
							hintsXText[i][j] = '<em>' + Math.abs(hintsX[i][j]) + '</em>';
						} else {
							hintsXText[i][j] = '<strong>' + hintsX[i][j] + '</strong>';
						}
					}
					xSpace = hintsX[i].reduce((acc, cur) => acc + cur, hintsX[i].length - 1);
					hintsXText[i].push(this.charmSum(hintsX[i], xSpace, charmWidth));
				}
				for (let i = 0; i < hintsY.length; i++) {
					hintsYText[i] = [];
					for (let j = 0; j < hintsY[i].length; j++) {
						if (hintsY[i][j] < 0) {
							hintsYText[i][j] = '<em>' + Math.abs(hintsY[i][j]) + '</em>';
						} else {
							hintsYText[i][j] = '<strong>' + hintsY[i][j] + '</strong>';
						}
					}
					ySpace = hintsY[i].reduce((acc, cur) => acc + cur, hintsY[i].length - 1);
					hintsYText[i].push(this.charmSum(hintsY[i], ySpace, charmHeight));
				}
			} else {
				for (let i = 0; i < hintsX.length; i++) {
					hintsXText[i] = [];
					for (let j = 0; j < hintsX[i].length; j++) {
						hintsXText[i][j] = '<strong>' + Math.abs(hintsX[i][j]) + '</strong>';
					}
				}
				for (let i = 0; i < hintsY.length; i++) {
					hintsYText[i] = [];
					for (let j = 0; j < hintsY[i].length; j++) {
						hintsYText[i][j] = '<strong>' + Math.abs(hintsY[i][j]) + '</strong>';
					}
				}
			}

			document.getElementById("perfectStreak").style.fontSize = (15 + Math.floor(Math.log2(this.model.get('perfectStreak') + 1))).toString() + "px";

			let html = '<table>';
			html += '<tr><td class="key"></td>';
			for (let i = 0; i < state[0].length; i++) {
				html += '<td class="key top">' + hintsYText[i].join('<br/>') + '</td>';
			}
			html += '</tr>';
			for (let i = 0; i < state.length; i++) {
				html += '<tr><td class="key left">' + hintsXText[i].join('') + '</td>';
				for (let j = 0; j < state[0].length; j++) {
					html += '<td class="cell s' + Math.abs(state[i][j]) + '" data-x="' + i + '" data-y="' + j + '"></td>';
				}
				html += '</tr>';
			}
			html += '</table>';

			$('#puzzle').html(html);

			let side = (600 - (state[0].length * 5)) / state[0].length;
			$('#puzzle td.cell').css({
				width: side,
				height: side,
				fontSize: Math.ceil(200 / state[0].length),
				borderWidth: Math.ceil(20 / state[0].length)
			});
		}
	});

	new PuzzleView({
		model: new PuzzleModel()
	});

});

function localStorageSupport() {
	try {
		return 'localStorage' in window && window.localStorage !== null;
	} catch (e) {
		return false;
	}
}
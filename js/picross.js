import {
	isCharminGallery,
	getCharmSolveInformation,
	getCharmDimensions,
	testCharmPlayability
} from "./modules/charmgallery.js";
/* import {
	checkAchievementCompletion,
	renderAchievements,
	updateAchievementList
} from "./modules/achievementhandler.js"; */
/* import {
	exportSave,
	importSave
} from "./modules/saveload.js" */
import {
	round25,
	nthRoot,
	romanize,
	nFormatter
} from "./modules/utilities.js";

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
				// optimisation update
				noSumMode: false,
				// achievements update
				/* achievements: [] */
			}
		},

		initialize: function () {
			this.on('change', this.save);
		},

		/*  >>> DO NOT OPTIMISE ZONE <<< */
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
				// optimisations update
				localStorage['charmStudiesLite.noSumMode'] = JSON.stringify(this.get('noSumMode'));
				// achievements update
				/* updateAchievementList.call(this);
				localStorage['charmStudiesLite.achievements'] = JSON.stringify(this.get('achievements')); */
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
				let defaultKey = (saveKey.split(".")).at(-1);
				let newKey = JSON.stringify(defaults[defaultKey])
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
			// optimisations update
			const noSumMode = JSON.parse(safeLocalStorage('charmStudiesLite.noSumMode'));
			// achievements update
			/* const achievements = JSON.parse(safeLocalStorage('charmStudiesLite.achievements')); */


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
				// optimisations update
				noSumMode: noSumMode,
				// achievements update
				/* achievements: achievements */
			});
		},
		/*  >>> END OF DO NOT OPTIMISE ZONE <<< */

		reset: function (customSeed) {

			let seed = customSeed;
			if (seed === undefined) {
				seed = '' + new Date().getTime();
			}
			Math.seedrandom(seed);

			let solution = [];
			let state = [];
			let total = 0;
			
			let charmHeight = this.get('dimensionHeight');
			let charmWidth = this.get('dimensionWidth');

			if (isCharminGallery(seed)) {
				[state, solution, total] = getCharmSolveInformation(seed);
			} else {
				for (let i = 0; i < charmHeight; i++) {
					solution[i] = [];
					state[i] = [];
					for (let j = 0; j < charmWidth; j++) {
						let random = Math.ceil(Math.random() * 2);
						solution[i][j] = random;
						total += (random - 1);
						state[i][j] = 0;
					}
				}
			}

			let hintsX = this.getHints(solution, "x");
			let hintsY = this.getHints(solution, "y");
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

		getHints: function (solution, direction = "x") {
			let hints = [];
			let primaryDimension, secondaryDimension, cellValueGetter;

			if (direction === "y") {
				primaryDimension = this.get('dimensionWidth');
				secondaryDimension = this.get('dimensionHeight');
				cellValueGetter = (i, j) => solution[j][i]; // vertical
			} else {
				primaryDimension = this.get('dimensionHeight');
				secondaryDimension = this.get('dimensionWidth');
				cellValueGetter = (i, j) => solution[i][j]; // horizontal (default)
			}

			for (let i = 0; i < primaryDimension; i++) {
				let streak = 0;
				hints[i] = [];

				for (let j = 0; j < secondaryDimension; j++) {
					let cellValue = cellValueGetter(i, j);

					if (cellValue >= 2) {
						streak++;
						continue;
					}

					if (streak > 0) {
						hints[i].push(streak);
						streak = 0;
					}
				}

				if (streak > 0) {
					hints[i].push(streak);
				}
			}

			return hints;
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

			const updateHints = (hints, index, isRow) => {
				let filled = true;
				let cellIndex = 0;
				let hintIndex = 0;
				const length = isRow ? state[index].length : state.length;
				const checkValue = isRow ? (i) => state[index][i] : (i) => state[i][index];

				for (cellIndex; cellIndex < length;) {
					if (checkValue(cellIndex) !== 2) {
						cellIndex++;
						continue;
					}
					if (hintIndex >= hints[index].length) {
						filled = false;
						break;
					}
					for (let i = 0; i < Math.abs(hints[index][hintIndex]); i++) {
						if (cellIndex >= length || checkValue(cellIndex) !== 2) {
							filled = false;
							break;
						}
						cellIndex++;
					}
					if (cellIndex < length && checkValue(cellIndex) === 2) {
						filled = false;
						break;
					}
					hintIndex++;
				}
				if (cellIndex < length || hintIndex < hints[index].length) {
					filled = false;
				}
				for (let i = 0; i < hints[index].length; i++) {
					hints[index][i] = Math.abs(hints[index][i]) * (filled ? -1 : 1);
				}
			};

			// cross out row hints
			updateHints(hintsX, x, true);

			// cross out column hints
			updateHints(hintsY, y, false);

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
			state.forEach((column, y) => {
				column.forEach((cell, x) => {
					if (cell === 9) {
						state[y][x] = 1;
						markedCells.push([y, x]);
					}
				});
			});

			let hintsX = this.get('hintsX');
			let hintsY = this.get('hintsY');
			let solutionX = this.getHints(state, "x");
			let solutionY = this.getHints(state, "y");

			function compareHints(hints, solution) {
				for (let i = 0; i < hints.length; i++) {
					if (hints[i].length !== solution[i].length) {
						return false;
					}
					for (let j = 0; j < hints[i].length; j++) {
						if (Math.abs(hints[i][j]) !== solution[i][j]) {
							return false;
						}
					}
				}
				return true;
			}

			let perfectX = compareHints(hintsX, solutionX);
			let perfectY = compareHints(hintsY, solutionY);
			perfect = perfectX && perfectY;

			// reverting marked cells if not perfect
			if (!perfect) markedCells.forEach(([y, x]) => state[y][x] = 9);

			return perfect;
		}

	});

	let PuzzleView = Backbone.View.extend({

		el: $("body"),

		events: function () {
			const baseEvents = {
				"change #autoPause": "changeAutoPauseMode",
				"change #dark": "changeDarkMode",
				"change #easy": "changeEasyMode",
				"change #showTimer": "changeTimerDisplayMode",
				"change #noSum": "changeNoSumMode",
				/* "click #achievements": "achievementHandler", */
				"click #customSeed": function (e) {
					e.currentTarget.select();
				},
				/* "click #exportSave": "exportStorage",  */
				"click #galleryStudy": "galleryStudy",
				/* "click #importSave": "importStorage", */
				"click #new": "newGame",
				"click #prestigeExperience": "prestigeExperience",
				"click #seed": function (e) {
					e.currentTarget.select();
				},
				"click #solve": "solve",
				"contextmenu": function (e) {
					e.preventDefault();
				},
				"click #theCookieOfAllTime": "sweetTreat",
				/* "click #updateAchievements": "achievementHandler", */
				"mousedown": "clickStart",
				"mouseout td.cell": "mouseOut",
				"mouseover td.cell": "mouseOver",
				"mouseup": "clickEnd",
				"submit #customForm": "newCustom",
			};

			if (touchSupport && 'ontouchstart' in document.documentElement) {
				Object.assign(baseEvents, {
					"touchend td.cell": "touchEnd",
					"touchmove td.cell": "touchMove",
					"touchstart td.cell": "touchStart"
				});
			}

			return baseEvents;
		},

		mouseStartX: -1,
		mouseStartY: -1,
		mouseEndX: -1,
		mouseEndY: -1,
		mouseMode: 0,

		initialize: function () {
			this.model.resume();
			$('#dimensions').val(this.model.get('dimensionWidth') + 'x' + this.model.get('dimensionHeight'));
			$('#dark').prop('checked', this.model.get('darkMode'));
			$('#easy').prop('checked', this.model.get('easyMode'));
			$('#showTimer').prop('checked', this.model.get('timerDisplayMode'));
			$('#autoPause').prop('checked', this.model.get('autoPauseMode'));
			$('#noSum').prop('checked', this.model.get('noSumMode'));
			this.render();
			this.showSeed();
		},

		/* importStorage: function () {
			importSave.call(this);
		}, */

		/* exportStorage: function () {
			exportSave();
		}, */

		updateMode: function (selector, modelKey) {
			const isChecked = $(selector).prop('checked');
			this.model.set({
				[modelKey]: isChecked
			});
			this.render();
		},

		changeDarkMode: function () {
			this.updateMode('#dark', 'darkMode');
		},
		changeEasyMode: function () {
			this.updateMode('#easy', 'easyMode');
		},
		changeAutoPauseMode: function () {
			this.updateMode('#autoPause', 'autoPauseMode');
		},
		changeTimerDisplayMode: function () {
			this.updateMode('#showTimer', 'timerDisplayMode');
		},
		changeNoSumMode: function () {
			this.updateMode('#noSum', 'noSumMode');
		},

		changeDimensions: function (seed) {
			let dimensions = (isCharminGallery(seed)) ? getCharmDimensions(seed) : $('#dimensions').val();
			$('#dimensions').val(dimensions);
			dimensions = dimensions.split('x');
			this.model.set({
				dimensionWidth: dimensions[0],
				dimensionHeight: dimensions[1]
			});
		},

		galleryStudy: function (e) {
			e.preventDefault();
			let selectedCharm = document.getElementById("original-charms").value;
			if (selectedCharm !== "default") this._newGame(selectedCharm);
		},

		_newGame: function (customSeed) {
			if (!this.model.isPerfect()) this.storeExperience();
			document.getElementById("original-charms").value = "default";
			$('#solve').prop('disabled', false).text('Finish Charm!');
			$('#puzzle').removeClass('complete perfect');
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
			customSeed.length ? this._newGame(customSeed) : this._newGame();
		},

		showSeed: function () {
			let seed = this.model.get('seed');
			$('#seed').val(seed);
		},

		clickStart: function (e) {
			if (this.model.get('complete')) return;

			let target = $(e.target);

			if (this.mouseMode !== 0 || target.attr('data-x') === undefined || target.attr('data-y') === undefined) {
				this.mouseMode = 0;
				this.render();
				return;
			}

			this.mouseStartX = target.attr('data-x');
			this.mouseStartY = target.attr('data-y');

			e.preventDefault();
			this.mouseMode = e.which;
		},

		mouseOver: function (e) {
			let target = $(e.currentTarget);
			let endX = target.attr('data-x');
			let endY = target.attr('data-y');
			this.mouseEndX = endX;
			this.mouseEndY = endY;

			$('td.hover, td.hoverLight').removeClass('hover hoverLight');

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

			function highlightCells(primaryAxis, secondaryAxis, startPrimary, endPrimary, constantSecondary, diff) {
				$('td.cell[data-' + primaryAxis + '=' + endPrimary + ']').addClass('hoverLight');

				let start = Math.min(startPrimary, endPrimary);
				let end = Math.max(startPrimary, endPrimary);

				for (let i = start; i <= end; i++) {
					$('td.cell[data-' + primaryAxis + '=' + i + '][data-' + secondaryAxis + '=' + constantSecondary + ']').addClass('hover');
				}

				let endCell = $('td.cell[data-' + primaryAxis + '=' + endPrimary + '][data-' + secondaryAxis + '=' + constantSecondary + ']');
				endCell.text(diff + 1);
				if (endCell.hasClass('s1')) {
					endCell.addClass('hidden-content').css("color", "#ffb6c8");
				}

				let startCell = $('td.cell[data-' + primaryAxis + '=' + startPrimary + '][data-' + secondaryAxis + '=' + constantSecondary + ']');
				startCell.text(diff + 1);
				if (startCell.hasClass('s1')) {
					startCell.addClass('hidden-content').css("color", "#ffb6c8");
				}
			}

			if (diffX > diffY) {
				highlightCells('x', 'y', startX, endX, startY, diffX);
			} else {
				highlightCells('y', 'x', startY, endY, startX, diffY);
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

			function updateCellContent(primaryAxis, primaryValue, secondaryAxis, secondaryValue) {
				let cellSelector = `td.cell[data-${primaryAxis}='${primaryValue}'][data-${secondaryAxis}='${secondaryValue}']`;
				let cell = $(cellSelector);

				cell.remove('hidden-content');
				cell.text('');

				if (cell.hasClass('hidden-content')) {
					cell.removeClass('hidden-content');
				}
			}

			if (diffX > diffY) {
				updateCellContent('x', endX, 'y', startY);
			} else {
				updateCellContent('x', startX, 'y', endY);
			}
		},

		clickEnd: function (e) {
			if (this.model.get('complete')) return;

			let target = $(e.target);

			const clickModes = {
				1: 2, // left click
				2: 9, // middle click
				3: 1 // right click
			};


			if (this.mouseMode !== e.which) {
				this.mouseMode = 0;
				return;
			}

			const dataX = target.attr('data-x');
			const dataY = target.attr('data-y');

			const x = (dataX !== undefined || dataY !== undefined) ? dataX : this.mouseEndX;
			const y = (dataX !== undefined || dataY !== undefined) ? dataY : this.mouseEndY;


			e.preventDefault();

			this.clickArea(x, y, clickModes[e.which]);

			this.mouseMode = 0;
			this.render();
			this.checkCompletion();
		},

		checkCompletion: function () {
			if (this.model.isPerfect()) this.solve();
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

		calculateMaxExperience: function () {
			let charmWidth = Number(this.model.get('dimensionWidth'));
			let charmHeight = Number(this.model.get('dimensionHeight'));
			let total = this.model.get('total');

			let dimensionAdjust = Math.pow((charmWidth + charmHeight) / 2, 2).toFixed(0); // exp multi based off size

			let hintsX = this.model.get('hintsX');
			let hintsY = this.model.get('hintsY');

			let calculateComplexity = (hints, dimension) => {
				return hints.reduce((totalComplexity, hint) => {
					let sum = hint.reduce((acc, val) => acc + val + 1, -1);
					if (sum < 0 && hints.length == 0) return totalComplexity; // skip zeroes
					let median = Math.ceil(dimension / 2);
					let spaceDiff = Math.abs(sum - median);

					let pascalBias = (spaceDiff && sum > 0) // check if not highest possibilities (nCr), if sum 0, no xp awarded
						?
						1 + Math.abs(1 / (sum - median)) :
						2.5;
					let separationMulti = 1 + 0.5 * (hint.length - 1); // consider rows/columns that have more than one hint number more complex

					return totalComplexity + (pascalBias * separationMulti);
				}, 0);
			};

			let totalComplexity = calculateComplexity(hintsX, charmWidth) + calculateComplexity(hintsY, charmHeight);

			let triangle = charmWidth * charmHeight / 2; // triangle area = 1/2 bh

			let biasFactor = triangle > total ? 0.025 : 0.005; // more bias for smaller charms
			let sparseBias = 1 + biasFactor * Math.abs(total - triangle); // give bonus to charms with few cells compared to more populated ones

			let formulaXP = dimensionAdjust * totalComplexity * sparseBias;
			if (this.model.get('seed') === this.model.get('charmExhaustedID')) { // disincentivise repeating charms in a row
				formulaXP /= 4;
			}
			let maxXP = round25(formulaXP); // round to nearest 25 because aesthetic idk

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
			if (!maxXP) { // clearStorage fix
				this.calculateMaxExperience();
				maxXP = this.model.get('charmMaxExperience');
			}

			// convert marks to crosses
			let markedCells = [];
			state.forEach((row, y) => {
				row.forEach((cell, x) => {
					if (cell === 9) {
						state[y][x] = 1;
						markedCells.push([y, x]);
					}
				});
			});

			let hintsX = this.model.get('hintsX');
			let hintsY = this.model.get('hintsY');
			let solutionX = this.model.getHints(state, "x");
			let solutionY = this.model.getHints(state, "y");

			// accuracy will be determined by imperfection finding

			const countIncorrectRuns = (hints, solution) => {
				let allRuns = 0;
				let incorrectRuns = 0;

				hints.forEach((hint, i) => {
					if (hint.length === 0) return;

					allRuns++;

					if (hint.length !== solution[i].length) {
						incorrectRuns++;
						return;
					}

					for (let j = 0; j < hint.length; j++) {
						if (Math.abs(hint[j]) !== solution[i][j]) {
							incorrectRuns++;
							break;
						}
					}
				});

				return {
					allRuns,
					incorrectRuns
				};
			};

			const {
				allRuns: allRunsX,
				incorrectRuns: incorrectRunsX
			} = countIncorrectRuns(hintsX, solutionX);
			const {
				allRuns: allRunsY,
				incorrectRuns: incorrectRunsY
			} = countIncorrectRuns(hintsY, solutionY);

			let allRuns = allRunsX + allRunsY;
			let incorrectRuns = incorrectRunsX + incorrectRunsY;

			// reverting marked cells
			markedCells.forEach(([y, x]) => state[y][x] = 9);

			let accuracy = (allRuns - incorrectRuns) / allRuns;
			let xp = round25((progress * accuracy) * maxXP);

			this.model.set({
				charmExperience: xp
			});
		},

		expToLv: function (experience) {
			let playerPrestige = this.model.get('playerPrestige');

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

		lvToExp: function (level) {
			let playerPrestige = this.model.get('playerPrestige');
			let result = round25((expCalcBase + (level / expCalcConstant) ** expCalcPower) ** (1 + (expCalcPrestigeFactor * playerPrestige)));
			return result;
		},

		storeExperience: function () {
			let progress = this.model.get('guessed') / this.model.get('total') * 100;
			let currentXPBuffer = this.model.get('playerExperienceBuffer');
			let charmExperience = this.model.get('charmExperience');

			if (progress > 100) progress = 10; // punish over 100% progress
			progress = progress / 100;

			let progressAdjust = progress + 0.15; // reward players who only give up late, still punishing to players who give up early
			progressAdjust = progressAdjust > 1 ? 1 : progressAdjust; // don't allow give up bonus to exceed 100%

			let newXPbuffer = round25((charmExperience * progressAdjust) + currentXPBuffer);
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

			function lvToTitle(level) {
				const titles = {
					0: "Clueless Cassia",
					"MAX": "True Logician"
				};

				const perFiveLevelsTitles = [
					"Charms 101 Student", // beginner class
					"Desk Sleeper", // what cassia always ends up doing
					"Graduate-to-be", // in alignment with cassia's goals
					"Connection Capturer", // connection magic charm + cassia wants to have a connection with senna
					"Amateur Illusionist", // illusion magic, taught in charms II
					"Adept Abstractor", // abstractor is profession who analyses data, hence analysing charms to solve them
					"Intermediate Imbuer", // charms imbue an object with magic
					"Charmed Individual", // "lucky individual" + "charmed life" - senna
					"Concentrated Learner", // "places with a high concentration of magic" - senna
					"Random Resolver", // "these questions are completely random..." -  senna
					"Reliable Authority", // "reliable as a friend" - cassia
					"Diligent Tutor", // senna tutors to the best of her ability
					"Fluent Painter", // "fluid" - hence fluent - pillars of magic
					"Proficient Artist", // cassia bought into the myth that witch hair length improves proficiency
					"Arithmagic Ace", // senna's favourite class, see also Random Resolver
					"Wise Witch", // senna's favoured familiar - owls, often seen as wise
					"Spell Scholar", // senna wants (or rather needs) scholarships for her figwood entry
					"Charm Extraordinaire", // no reference
					"Figwood Prodigy", // figwood - top magic school for witches
					"Infinite Intellect" // "i do not have endless time" - infinite is synonym of endless
				];

				if (titles.hasOwnProperty(level)) {
					return titles[level];
				} else if (typeof level === 'number' && level > 0) {
					let lvFiveIncrement = Math.floor(level / 5);
					return perFiveLevelsTitles[Math.min(lvFiveIncrement, perFiveLevelsTitles.length - 1)];
				}
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

			let charmsPerfect = this.model.get('charmsPerfect');
			let perfectStreak = 0;

			if (perfect) {
				charmsPerfect += 1;
				perfectStreak = this.model.get('perfectStreak') + 1;
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
			/* checkAchievementCompletion.call(this); */

			this.render();
		},

		charmSum: function (hints, space, dimension) {
			dimension = Number(dimension);
			let sumTag = "strong";
			let sumClass = "smol";
			let tooltipText = "";
			let sumTooltip = "";

			if (space < 0) {
				space = "✪"
				sumTag = "em";
				sumClass = "";
			} else if (space == dimension) { // full row/column can be filled, one possibility
				sumClass = "smol full tooltip";
				tooltipText = "Can complete row/column!";
			} else {
				let isPartial = false;
				let spaceDifference = dimension - space;
				hints.forEach(hint => {
					if (hint > spaceDifference) {
						isPartial = true;
					}
				});

				if (isPartial) { // part of row/column can be filled, multiple possibilities
					sumClass = "smol partial tooltip";
					tooltipText = "Can partially complete row/column.";
				}
			}

			if (tooltipText) {
				sumTooltip = `<span class="tooltiptext">${tooltipText}</span>`;
			}

			return `<${sumTag} class="${sumClass}">${space}${sumTooltip}</${sumTag}>`
		},

		/* sweetTreat: function () {
			let achievements = this.model.get('achievements');
			(achievements.find(achv => achv.id == "achv-SweetTreat")).completed = true;
			this.achievementHandler();
		}, */

		/* achievementHandler: function () {
			renderAchievements.call(this);
		}, */

		render: function () {
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

			let charmWidth = this.model.get('dimensionWidth');
			let charmHeight = this.model.get('dimensionHeight');

			function processHints(hints, isEasyMode, dimension) {
				let noSumMode = this.model.get('noSumMode');
				return hints.map(hintArray => {
					let processedHints = hintArray.map(value => {
						if (isEasyMode || this.model.get('complete')) {
							return value < 0 ? `<em>${Math.abs(value)}</em>` : `<strong>${value}</strong>`;
						} else {
							return `<strong>${Math.abs(value)}</strong>`;
						}
					});

					if (isEasyMode) {
						let space = hintArray.reduce((acc, cur) => acc + cur, hintArray.length - 1);
						if (!noSumMode) {
							processedHints.push(this.charmSum(hintArray, space, dimension));
						}
					}
					return processedHints;
				});
			}

			if (this.model.get('easyMode') || this.model.get('complete')) {
				hintsXText = processHints.call(this, hintsX, true, charmWidth);
				hintsYText = processHints.call(this, hintsY, true, charmHeight);
			} else {
				hintsXText = processHints.call(this, hintsX, false, charmWidth);
				hintsYText = processHints.call(this, hintsY, false, charmHeight);
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
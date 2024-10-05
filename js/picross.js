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

	// localStorage save format versioning (legacy code)
	const saveVersion = '2024.08.06';

	const touchSupport = true;

	// Experience calculation constants
	const expCalcConstant = 0.1;
	const expCalcPower = 2;
	const expCalcBase = 400;
	const expCalcPrestigeFactor = 0.01;
	const expEventMulti = 2;

	let PuzzleModel = Backbone.Model.extend({

		/**
		 * Gets the default save attributes.
		 * @typedef {{ ...}} defaults
		 */
		defaults: function () {
			return {
				// Stat definitions
				dimensionWidth: 10, // Charm width
				dimensionHeight: 10, // Charm height
				state: [], // Board state
				hintsX: [], // Row hints
				hintsY: [], // Column hints
				guessed: 0, // Tiles painted (cells filled)
				total: 100, // Tiles to paint (number of cells to correctly fill)
				complete: false, // If charm is complete or not
				perfect: false, // If charm is completed perfectly or not
				seed: 0, // Charm seed
				darkMode: false, // Dark mode
				easyMode: true, // Crossouts + sums
				// Stats update
				perfectStreak: 0, // How many charms done perfectly in a row
				charmsComplete: 0, // How many charms done
				charmsPerfect: 0, // How many charms done perfectly
				// Experience update
				playerExperience: 0, // Player XP
				playerExperienceBuffer: 0, // Player XP not yet claimed (acquired when giving up a charm)
				playerPrestige: 0, // Prestige level (experience restart count)
				charmExperience: 0, // Experience player has earned from their current charm
				charmMaxExperience: 0, // Experience player can earn for completing the charm perfectly
				autoPauseMode: true, // If the charm will pause when not in focus
				timerDisplayMode: true, // If the timer is visible, or hidden with "=^.^"=
				charmExhaustedID: "", // The ID of the last charm completed (to incentivise playing unique charms and discourage repetition)
				// Optimisation update
				noSumMode: false, // Takes off sums from easy mode
				// Achievements update
				/* achievements: [] */
			}
		},


		/**
		 * Sets up the universal function for Backbone to save any time *change* is triggered.
		 */
		initialize: function () {
			this.on('change', this.save);
		},


		/*  >>> DO NOT OPTIMISE ZONE <<< 
			I have had trouble optimising the save and resume functions in the past, so unfortunately DRY (Don't Repeat Yourself) is hard to not violate here.
			Please let me know if you are going to work on these, and if you find a better way to deal with this, also let me know!
		*/


		/**
		 * Saves the player's game info in localStorage. (5MB max, no concern of being near capacity thus far)
		 */
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

				localStorage['charmStudiesLite.stats.perfectStreak'] = JSON.stringify(this.get('perfectStreak'));
				localStorage['charmStudiesLite.stats.charmsComplete'] = JSON.stringify(this.get('charmsComplete'));
				localStorage['charmStudiesLite.stats.charmsPerfect'] = JSON.stringify(this.get('charmsPerfect'));

				localStorage['charmStudiesLite.stats.EXP.playerExperience'] = JSON.stringify(this.get('playerExperience'));
				localStorage['charmStudiesLite.stats.EXP.playerExperienceBuffer'] = JSON.stringify(this.get('playerExperienceBuffer'));
				localStorage['charmStudiesLite.stats.EXP.playerPrestige'] = JSON.stringify(this.get('playerPrestige'));
				localStorage['charmStudiesLite.stats.EXP.charmExperience'] = JSON.stringify(this.get('charmExperience'));
				localStorage['charmStudiesLite.stats.EXP.charmMaxExperience'] = JSON.stringify(this.get('charmMaxExperience'));
				localStorage['charmStudiesLite.timer.autoPauseMode'] = JSON.stringify(this.get('autoPauseMode'));
				localStorage['charmStudiesLite.timer.timerDisplayMode'] = JSON.stringify(this.get('timerDisplayMode'));
				localStorage['charmStudiesLite.stats.EXP.charmExhaustedID'] = JSON.stringify(this.get('charmExhaustedID'));

				localStorage['charmStudiesLite.noSumMode'] = JSON.stringify(this.get('noSumMode'));

				/* updateAchievementList.call(this);
				localStorage['charmStudiesLite.achievements'] = JSON.stringify(this.get('achievements')); */
			}
		},

		/**
		 * On loading the game, loads all the game info attributes of localStorage into Backbone to use.
		 */
		resume: function () {

			if (!localStorageSupport() || localStorage['picross2.saveVersion'] != saveVersion) {
				this.reset();
				return;
			}

			let defaults = this.defaults()


			/**
			 * Safely retrieves a value for a save attribute. If any attribute undefined, return the default.
			 * @param {String} saveKey 
			 */
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

			const perfectStreak = JSON.parse(safeLocalStorage('charmStudiesLite.stats.perfectStreak'));
			const charmsComplete = JSON.parse(safeLocalStorage('charmStudiesLite.stats.charmsComplete'));
			const charmsPerfect = JSON.parse(safeLocalStorage('charmStudiesLite.stats.charmsPerfect'));

			const playerExperience = JSON.parse(safeLocalStorage('charmStudiesLite.stats.EXP.playerExperience'));
			const playerExperienceBuffer = JSON.parse(safeLocalStorage('charmStudiesLite.stats.EXP.playerExperienceBuffer'));
			const playerPrestige = JSON.parse(safeLocalStorage('charmStudiesLite.stats.EXP.playerPrestige'));
			const charmExperience = JSON.parse(safeLocalStorage('charmStudiesLite.stats.EXP.charmExperience'));
			const charmMaxExperience = JSON.parse(safeLocalStorage('charmStudiesLite.stats.EXP.charmMaxExperience'));
			const autoPauseMode = JSON.parse(safeLocalStorage('charmStudiesLite.timer.autoPauseMode'));
			const timerDisplayMode = JSON.parse(safeLocalStorage('charmStudiesLite.timer.timerDisplayMode'));
			const charmExhaustedID = JSON.parse(safeLocalStorage('charmStudiesLite.stats.EXP.charmExhaustedID'));

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
				perfectStreak: perfectStreak,
				charmsComplete: charmsComplete,
				charmsPerfect: charmsPerfect,
				playerExperience: playerExperience,
				playerExperienceBuffer: playerExperienceBuffer,
				playerPrestige: playerPrestige,
				charmExperience: charmExperience,
				charmMaxExperience: charmMaxExperience,
				autoPauseMode: autoPauseMode,
				timerDisplayMode: timerDisplayMode,
				charmExhaustedID: charmExhaustedID,
				noSumMode: noSumMode,
				/* achievements: achievements */
			});
		},


		/*  >>> END OF DO NOT OPTIMISE ZONE <<< */

		/**
		 * Resets the board's state (starts a new charm).
		 * @param {String} customSeed Any seed inputted through the custom entry, or a seed from the Charm Gallery.
		 */
		reset: function (customSeed) {

			let seed = customSeed;
			if (seed === undefined) { // Generate a millisecond Unix seed if no seed inputted (onpress New Game)
				seed = '' + new Date().getTime();
			}
			Math.seedrandom(seed); // Set the seed for Math.random 

			// Board initialising
			let solution = [];
			let state = [];
			let total = 0;

			let charmHeight = this.get('dimensionHeight');
			let charmWidth = this.get('dimensionWidth');

			if (isCharminGallery(seed)) { // For charm gallery seeds
				[state, solution, total] = getCharmSolveInformation(seed);
			} else {
				// Generate random board
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
			// state = solution; // DEV TEST: Will auto-fill board with correct solution.

			this.set({
				state: state,
				hintsX: hintsX,
				hintsY: hintsY,
				guessed: 0, // total, // DEV TEST: Will let progress be 100%.
				total: total,
				complete: false,
				perfect: false,
				seed: seed
			}, {
				silent: true
			});
			this.trigger('change');
		},

		/**
		 * Returns the hint numbers for all rows/columns.
		 * @param {Array[]} solution The state of the board.
		 * @param {String} direction The direction to go in. x (horizontally) by default.
		 * @returns {Array[]} All row/column hints as a 2D array.
		 */
		getHints: function (solution, direction = "x") {
			let hints = [];
			let primaryDimension, secondaryDimension, cellValueGetter;

			if (direction === "y") {
				primaryDimension = this.get('dimensionWidth');
				secondaryDimension = this.get('dimensionHeight');
				cellValueGetter = (i, j) => solution[j][i]; // Vertical
			} else {
				primaryDimension = this.get('dimensionHeight');
				secondaryDimension = this.get('dimensionWidth');
				cellValueGetter = (i, j) => solution[i][j]; // Horizontal
			}

			for (let i = 0; i < primaryDimension; i++) {
				let streak = 0;
				hints[i] = [];

				for (let j = 0; j < secondaryDimension; j++) {
					let cellValue = cellValueGetter(i, j);

					if (cellValue >= 2) { // Skip painted and highlighted tiles
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

		/**
		 * Updates the state of a cell according to its guess.
		 * @param {Number} x The x-coordinate of the cell to guess.
		 * @param {Number} y The y-coordinate of the cell to guess.
		 * @param {Number} guess The guess (state) of the cell to check against.
		 */
		guess: function (x, y, guess) {
			let state = this.get('state');
			let guessed = this.get('guessed');

			if (state[x][y] === 2) { // If tile already painted, decrement the guessed count
				guessed--;
			}

			if (state[x][y] === guess) { // If guess type same as existing tile type, revert to empty cell
				state[x][y] = 0;
			} else {
				state[x][y] = guess;
				if (guess === 2) { // Increment the guessed count
					guessed++;
				}
			}

			this.set({
				state: state,
				guessed: guessed
			}, {
				silent: true
			});
			this.trigger('change');

			this.updateCrossouts(state, x, y); // Update the crossouts after a guess
		},

		/**
		 * Crosses out completed hints for the charm.
		 * @param {Array[]} state The current state of the board.
		 * @param {Number} x The row number to reference.
		 * @param {Number} y The column number to reference.
		 */
		updateCrossouts: function (state, x, y) {
			let hintsX = this.get('hintsX');
			let hintsY = this.get('hintsY');

			// Function to update hints based on current guesses
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

				// If the cellIndex or hintIndex doesn't cover the entire hint array, it's not filled
				if (cellIndex < length || hintIndex < hints[index].length) {
					filled = false;
				}

				// Update the hints to mark as filled or unfilled
				for (let i = 0; i < hints[index].length; i++) {
					hints[index][i] = Math.abs(hints[index][i]) * (filled ? -1 : 1);
				}
			};

			/* Blanket row/column (all hint) checks */
			// Cross out row hints
			updateHints(hintsX, x, true);
			// Cross out column hints
			updateHints(hintsY, y, false);

			// Cross out hints in X direction (left and right)
			const crossOutHintsInRow = (index) => {
				// Cross out left
				let tracker = 0;
				for (let hintIndex = 0; hintIndex < hintsX[index].length; hintIndex++) {
					while (Math.abs(state[index][tracker]) === 1) {
						tracker++;
					}
					if (state[index][tracker] === 0 || state[index][tracker] === 9) { // Stop tracking on empty or highlighted cells
						break;
					}
					let streak = hintsX[index][hintIndex];
					if (streak < 0) {
						tracker += Math.abs(streak);
						continue;
					}
					for (let j = 1; j <= streak; j++) {
						if (Math.abs(state[index][tracker]) === 2) {
							tracker++;
							if (j === streak && (tracker === state[0].length || Math.abs(state[index][tracker]) === 1)) {
								hintsX[index][hintIndex] = streak * -1;
							}
						} else {
							break;
						}
					}
				}

				// Cross out right
				tracker = state[0].length - 1;
				for (let hintIndex = hintsX[index].length - 1; hintIndex >= 0; hintIndex--) {
					while (Math.abs(state[index][tracker]) === 1) {
						tracker--;
					}
					if (state[index][tracker] === 0 || state[index][tracker] === 9) { // Stop tracking on empty or highlighted cells
						break;
					}
					let streak = hintsX[index][hintIndex];
					if (streak < 0) {
						tracker -= Math.abs(streak);
						continue;
					}
					for (let j = 1; j <= streak; j++) {
						if (Math.abs(state[index][tracker]) === 2) {
							tracker--;
							if (j === streak && (tracker === -1 || Math.abs(state[index][tracker]) === 1)) {
								hintsX[index][hintIndex] = streak * -1;
							}
						} else {
							break;
						}
					}
				}
			};

			// Cross out hints in Y direction (top and bottom)
			const crossOutHintsInColumn = (index) => {
				// Cross out top
				let tracker = 0;
				for (let hintIndex = 0; hintIndex < hintsY[index].length; hintIndex++) {
					while (Math.abs(state[tracker][index]) === 1) {
						tracker++;
					}
					if (state[tracker][index] === 0 || state[tracker][index] === 9) { // Stop tracking on empty or highlighted cells
						break;
					}
					let streak = hintsY[index][hintIndex];
					if (streak < 0) {
						tracker += Math.abs(streak);
						continue;
					}
					for (let j = 1; j <= streak; j++) {
						if (Math.abs(state[tracker][index]) === 2) {
							tracker++;
							if (j === streak && (tracker === state.length || Math.abs(state[tracker][index]) === 1)) {
								hintsY[index][hintIndex] = streak * -1;
							}
						} else {
							break;
						}
					}
				}

				// Cross out bottom
				tracker = state.length - 1;
				for (let hintIndex = hintsY[index].length - 1; hintIndex >= 0; hintIndex--) {
					while (Math.abs(state[tracker][index]) === 1) {
						tracker--;
					}
					if (state[tracker][index] === 0 || state[tracker][index] === 9) { // Stop tracking on empty or highlighted cells
						break;
					}
					let streak = hintsY[index][hintIndex];
					if (streak < 0) {
						tracker -= Math.abs(streak);
						continue;
					}
					for (let j = 1; j <= streak; j++) {
						if (Math.abs(state[tracker][index]) === 2) {
							tracker--;
							if (j === streak && (tracker === -1 || Math.abs(state[tracker][index]) === 1)) {
								hintsY[index][hintIndex] = streak * -1;
							}
						} else {
							break;
						}
					}
				}
			};

			/* Partial hint checks */
			crossOutHintsInRow(x);
			crossOutHintsInColumn(y);

			// Set the updated hints back to the model
			this.set({
				hintsX: hintsX,
				hintsY: hintsY
			}, {
				silent: true
			});
			this.trigger('change');
		},


		/**
		 * Checks if the charm has been completed perfectly.
		 * @returns {Boolean} True if perfect, false otherwise.
		 */
		isPerfect: function () {
			let perfect = true;
			let state = this.get('state');

			// Convert marks (highlights) to crossses
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

			/**
			 * Checks if the board state matches the charm hints for a given dimension.
			 * @param {Array} hints The hints derived from the board state.
			 * @param {Array} solution The hints of the charm.
			 * @returns {Boolean} If the board matches the hints perfectly.
			 */
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

			// Reverting marked cells if not perfect
			if (!perfect) markedCells.forEach(([y, x]) => state[y][x] = 9);

			return perfect;
		}

	});

	let PuzzleView = Backbone.View.extend({

		el: $("body"),

		/**
		 * Returns the list of events which can be triggered through in-game interaction.
		 * @typedef {{...}} events The list of events, dependent on device.
		 */
		events: function () {
			// The events shared on all devices
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

			// Events specifically for mobile devices
			if (touchSupport && 'ontouchstart' in document.documentElement) {
				Object.assign(baseEvents, {
					"touchend td.cell": "touchEnd",
					"touchmove td.cell": "touchMove",
					"touchstart td.cell": "touchStart"
				});
			}

			return baseEvents;
		},

		// Initial mouse settings
		mouseStartX: -1,
		mouseStartY: -1,
		mouseEndX: -1,
		mouseEndY: -1,
		mouseMode: 0,

		/**
		 * Function to intiialise the game from startup. Loads save attributes, sets settings (via checkboxes), and renders the board and seed.
		 */
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

		// Settings test functions - ignore this crappily done stuff
		/* importStorage: function () {
			importSave.call(this);
		}, */

		/* exportStorage: function () {
			exportSave();
		}, */

		/**
		 * Helper function to toggle setting modes on checkbox change.
		 * @param {String} selector The ID of the checkbox.
		 * @param {String} modelKey The mode to toggle.
		 */
		updateMode: function (selector, modelKey) {
			const isChecked = $(selector).prop('checked');
			this.model.set({
				[modelKey]: isChecked
			});
			this.render();
		},

		// See updateMode
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

		/**
		 * Sets the size of the board according to the dimensions value, or the specific charm value.
		 * @param {String} seed The charm seed (for Charm Gallery boards)
		 */
		changeDimensions: function (seed) {
			let dimensions = (isCharminGallery(seed)) ? getCharmDimensions(seed) : $('#dimensions').val();
			$('#dimensions').val(dimensions);
			dimensions = dimensions.split('x');
			this.model.set({
				dimensionWidth: dimensions[0],
				dimensionHeight: dimensions[1]
			});
		},

		/**
		 * Functionality for the Charm Gallery "Study Charm~" button. Starts a new game with the gallery select.
		 * @param {*} e Used with preventDefault to stop the refreshing of the page (button submitting does that) 
		 */
		galleryStudy: function (e) {
			e.preventDefault();
			let selectedCharm = document.getElementById("original-charms").value;
			if (selectedCharm !== "default") this._newGame(selectedCharm); // Will not trigger when "select charm" is present
		},

		/**
		 * Functionality for the "New Charm >" and "Custom Charm" buttons. Starts a new game.
		 * @param {String} customSeed The seed of the charm (used for dimensions and board generation with Charm Gallery).
		 */
		_newGame: function (customSeed) {
			if (!this.model.isPerfect()) this.storeExperience(); // Buffer charm experience if charm not perfect (given up)
			document.getElementById("original-charms").value = "default"; // Resets charm gallery selection
			$('#solve').prop('disabled', false).text('Finish Charm!'); // Enables solve button interactoin
			$('#puzzle').removeClass('complete perfect');
			$('#progress').removeClass('done');
			this.changeDimensions(customSeed);
			this.model.reset(customSeed);
			this.calculateMaxExperience();
			this.render();
			this.showSeed();
		},

		/**
		 * Literally just used to reset the custom seed value. I don't know why this is it's own function, but oh well.
		 */
		newGame: function () {
			$('#customSeed').val('');
			this._newGame();
		},

		/**
		 * Starts a new game with a custom ID.
		 * @param {*} e Used with preventDefault to stop the refreshing of the page (button submitting does that)
		 */
		newCustom: function (e) {
			e.preventDefault();
			let customSeed = $.trim($('#customSeed').val()); // Removes all trailing and leading whitespace.
			customSeed.length ? this._newGame(customSeed) : this._newGame();
		},

		/**
		 * Literally just used to show the seed. Why is this its own function, again?
		 * 	(it's probably reused a bunch and i'm just being salty)
		 */
		showSeed: function () {
			let seed = this.model.get('seed');
			$('#seed').val(seed);
		},

		/**
		 * Handles the mouse down event, sets the mouse mode according to the mouse button when on a cell.
		 * @param {*} e Used with preventDefault to stop the refreshing of the page (button submitting does that). Additionally used for detecting mouse mode.
		 */
		clickStart: function (e) {
			if (this.model.get('complete')) return;

			let target = $(e.target);

			if (this.mouseMode !== 0 || target.attr('data-x') === undefined || target.attr('data-y') === undefined) { // When not in charm, or mouse mode not initially 0 (none)
				this.mouseMode = 0;
				this.render();
				return;
			}

			this.mouseStartX = target.attr('data-x');
			this.mouseStartY = target.attr('data-y');

			e.preventDefault();
			this.mouseMode = e.which;
		},

		/**
		 * Handles cell hover events.
		 * @param {*} e Used to ascertain where the mouse is.
		 */
		mouseOver: function (e) {
			let target = $(e.currentTarget);
			let endX = target.attr('data-x');
			let endY = target.attr('data-y');
			this.mouseEndX = endX;
			this.mouseEndY = endY;

			$('td.hover, td.hoverLight').removeClass('hover hoverLight'); // Remove style classes from charm cells

			if (this.mouseMode === 0) { // If no mouse button pressed, add hover effects
				$('td.cell[data-y=' + endY + ']').addClass('hoverLight');
				$('td.cell[data-x=' + endX + ']').addClass('hoverLight');
				$('td.cell[data-x=' + endX + '][data-y=' + endY + ']').addClass('hover');
				return;
			}

			let startX = this.mouseStartX;
			let startY = this.mouseStartY;

			if (startX === -1 || startY === -1) { // If start and end coordinates still default (undetermined)
				return;
			}

			// Space differece between cells both horizontally and vertically
			let diffX = Math.abs(endX - startX);
			let diffY = Math.abs(endY - startY);

			/**
			 * Highlights a run of cells according to the difference and its properties.
			 * @param {String} primaryAxis 
			 * @param {String} secondaryAxis 
			 * @param {Number} startPrimary 
			 * @param {Number} endPrimary 
			 * @param {Number} constantSecondary 
			 * @param {Number} diff 
			 */
			function highlightCells(primaryAxis, secondaryAxis, startPrimary, endPrimary, constantSecondary, diff) {
				$('td.cell[data-' + primaryAxis + '=' + endPrimary + ']').addClass('hoverLight'); // For entire row/column, highlight cells

				let start = Math.min(startPrimary, endPrimary);
				let end = Math.max(startPrimary, endPrimary);

				// Add hover class for each cell gone over
				for (let i = start; i <= end; i++) {
					$('td.cell[data-' + primaryAxis + '=' + i + '][data-' + secondaryAxis + '=' + constantSecondary + ']').addClass('hover');
				}

				let startCell = $('td.cell[data-' + primaryAxis + '=' + startPrimary + '][data-' + secondaryAxis + '=' + constantSecondary + ']');
				startCell.text(diff + 1); // Show run length in start cell
				if (startCell.hasClass('s1')) { // Change text colour to pink if over a cross
					startCell.addClass('hidden-content').css("color", "#ffb6c8");
				}

				let endCell = $('td.cell[data-' + primaryAxis + '=' + endPrimary + '][data-' + secondaryAxis + '=' + constantSecondary + ']');
				endCell.text(diff + 1);
				if (endCell.hasClass('s1')) { // Show run length in end cell
					endCell.addClass('hidden-content').css("color", "#ffb6c8"); // Change text colour to pink if over a cross
				}
			}

			if (diffX > diffY) { // Horizontal difference vs Vertical difference - to determine drag orientation
				highlightCells('x', 'y', startX, endX, startY, diffX); // Horizontal
			} else {
				highlightCells('y', 'x', startY, endY, startX, diffY); // Vertical
			}
		},

		/**
		 * Handles the mouse out event. Removes hover effects, and adjusts cell styling.
		 */
		mouseOut: function () {
			if (this.mouseMode === 0) { // If mouse not held down, remove hover effects
				$('td.hover').removeClass('hover');
				$('td.hoverLight').removeClass('hoverLight');
			}

			let startX = this.mouseStartX;
			let startY = this.mouseStartY;
			let endX = this.mouseEndX;
			let endY = this.mouseEndY;

			let diffX = Math.abs(endX - startX);
			let diffY = Math.abs(endY - startY);

			/**
			 * Updates content of the cell according to its coordinates.
			 * @param {Number} x The x-coordinate of the cell.
			 * @param {Number} y The y-coordinate of the cell.
			 */
			function updateCellContent(x, y) {
				let cellSelector = `td.cell[data-x='${x}'][data-y='${y}']`;
				let cell = $(cellSelector);

				cell.remove('hidden-content'); // Removes ::after element
				cell.text(''); // Empties text contents of cell

				if (cell.hasClass('hidden-content')) { // Removes hidden-content class (from crossout cells)
					cell.removeClass('hidden-content');
				}
			}

			if (diffX > diffY) {
				updateCellContent(endX, startY); // Horizontal
			} else {
				updateCellContent(startX, endY); // Vertical
			}
		},

		/**
		 * Handles mouse up events.
		 * @param {*} e Used to ascertain where the mouse is.
		 */
		clickEnd: function (e) {
			if (this.model.get('complete')) return; // Prevent action on complete puzzle

			let target = $(e.target); // Get cell target

			const clickModes = {
				1: 2, // Left click ~ Paint
				2: 9, // Middle click ~ Cross out
				3: 1 // Right click ~ Mark/highlight
			};


			if (this.mouseMode !== e.which) { // Prevents drag-in action from clicks initially outside board
				this.mouseMode = 0;
				return;
			}

			const dataX = target.attr('data-x');
			const dataY = target.attr('data-y');

			// Use end cell if mouse not outside board
			const x = (dataX !== undefined || dataY !== undefined) ? dataX : this.mouseEndX; 
			const y = (dataX !== undefined || dataY !== undefined) ? dataY : this.mouseEndY;


			e.preventDefault(); // I'll be honest I have no clue what this does but I'm afraid to touch it

			this.clickArea(x, y, clickModes[e.which]); // Click the area selected with the appropriate mouse mode

			this.mouseMode = 0; // Resets mouse mode
			this.render();
			this.checkCompletion();
		},

		/**
		 * Handles auto-solve on perfect completion.
		 */
		checkCompletion: function () {
			if (this.model.isPerfect()) this.solve();
		},

		/**
		 * Clicks the selected area of tiles.
		 * @param {Number} endX The final x-coordinate for a run of cells.
		 * @param {Number} endY The final y-coordinate for a run of cells.
		 * @param {Number} guess The state to update the cells with.
		 */
		clickArea: function (endX, endY, guess) {
			let startX = this.mouseStartX;
			let startY = this.mouseStartY;

			if (startX === -1 || startY === -1) { // If invalid start coordinate, back out
				return;
			}

			let diffX = Math.abs(endX - startX);
			let diffY = Math.abs(endY - startY);

			if (diffX > diffY) {
				for (let i = Math.min(startX, endX); i <= Math.max(startX, endX); i++) { // Horizontal
					this.model.guess(i, startY, guess);
				}
			} else {
				for (let i = Math.min(startY, endY); i <= Math.max(startY, endY); i++) { // Vertical
					this.model.guess(startX, i, guess);
				}
			}
		},

		// not gonna lie i have not touched (ironically) the touchscreen handlers so just pray it works
		/**
		 * Handler for touch start events.
		 * @param {*} e Used to ascertain where the touch is.
		 */
		touchStart: function (e) {
			if (this.model.get('complete')) { // Disallow on complete puzzles
				return;
			}
			let target = $(e.target);
			this.mouseStartX = this.mouseEndX = e.originalEvent.touches[0].pageX;
			this.mouseStartY = this.mouseEndY = e.originalEvent.touches[0].pageY;
			let that = this; // Constant `this` context reference
			this.mouseMode = setTimeout(function () {
				that.model.guess(target.attr('data-x'), target.attr('data-y'), 1);
				that.render();
			}, 750);
		},

		/**
		 * Allows for non-large movement during press.
		 * @param {*} e Used to ascertain where the touch is.
		 */
		touchMove: function (e) {
			if (this.model.get('complete')) { // Disallow on complete puzzles
				return;
			}
			this.mouseEndX = e.originalEvent.touches[0].pageX;
			this.mouseEndY = e.originalEvent.touches[0].pageY;
			if (Math.abs(this.mouseEndX - this.mouseStartX) >= 10 || Math.abs(this.mouseEndY - this.mouseStartY) >= 10) { // If significant movement in hold period ...
				clearTimeout(this.mouseMode); // ... don't cause touch action
			}
		},

		/**
		 * Handler for touch end events.
		 * @param {*} e Used to ascertain where the touch was.
		 */
		touchEnd: function (e) {
			if (this.model.get('complete')) { // Disallow on complete puzzles
				return;
			}
			clearTimeout(this.mouseMode);
			let target = $(e.target);
			if (Math.abs(this.mouseEndX - this.mouseStartX) < 10 && Math.abs(this.mouseEndY - this.mouseStartY) < 10) { // If no signifcant movement ...
				this.model.guess(target.attr('data-x'), target.attr('data-y'), 2); // guess
				this.render();
				this.checkCompletion();
			}
		},

		/**
		 * Calculates the maximum experience for a charm given its dimensions, spacing, proportion of tiles, and hint combinations. 
		 */
		calculateMaxExperience: function () {
			let charmWidth = Number(this.model.get('dimensionWidth'));
			let charmHeight = Number(this.model.get('dimensionHeight'));
			let total = this.model.get('total');

			let dimensionAdjust = Math.pow((charmWidth + charmHeight) / 2, 2).toFixed(0); // Multiply EXP based off size

			let hintsX = this.model.get('hintsX');
			let hintsY = this.model.get('hintsY');

			let calculateComplexity = (hints, dimension) => {
				return hints.reduce((totalComplexity, hint) => {
					let sum = hint.reduce((acc, val) => acc + val + 1, -1); // Get sum of hints
					if (sum < 0 && hints.length == 0) return totalComplexity; // Skip empty rows/columns
					let median = Math.ceil(dimension / 2);
					let spaceDiff = Math.abs(sum - median);

					// Calculations in reference to Pascal's triangle - nCr, when r = median of n, most possibilities
					let pascalBias = (spaceDiff && sum > 0) // Reward rows/columns which have most possibilities, reduce XP multi for those that are more definite
						?
						1 + Math.abs(1 / (sum - median)) : // More definite
						2.5; // Most possibilities
					let separationMulti = 1 + 0.5 * (hint.length - 1); // Consider rows/columns that have more than one hint number more complex

					return totalComplexity + (pascalBias * separationMulti);
				}, 0);
			};

			let totalComplexity = calculateComplexity(hintsX, charmWidth) + calculateComplexity(hintsY, charmHeight);

			let triangle = charmWidth * charmHeight / 2; // Area of a triangle = 1/2(base * height) (middle amount of tiles)

			let biasFactor = triangle > total ? 0.025 : 0.005; // Bias towards charms with smaller than median tiles to paint (more difficult)
			let sparseBias = 1 + biasFactor * Math.abs(total - triangle); // Give bonus to charms with few cells compared to more populated ones

			let formulaXP = dimensionAdjust * totalComplexity * sparseBias; // Full calculation
			if (this.model.get('seed') === this.model.get('charmExhaustedID')) { // Disincentivise repeating charms in a row - charm exhaustion
				formulaXP /= 4;
			}
			let maxXP = round25(expEventMulti * formulaXP); // Round to nearest 25 because who wants 37 XP when you can have 50??

			this.model.set({
				charmMaxExperience: maxXP
			});

			this.calculateExperience();
		},

		/**
		 * Calculates the player's current XP to gain from this charm depending on progress and accuracy.
		 */
		calculateExperience: function () {
			let state = this.model.get('state');

			let progress = this.model.get('guessed') / this.model.get('total') * 100;
			if (progress > 100) { // Punish player for painting too many tiles
				progress = 10;
			}
			progress = progress / 100; // Convert to decimal multiplier from percentage

			let maxXP = this.model.get('charmMaxExperience');
			if (!maxXP) { // Fix: Clearing localStorage would cause the maximum experience for the default charm as 0 without this
				this.calculateMaxExperience();
				maxXP = this.model.get('charmMaxExperience');
			}

			// Convert marks (highlights) to crosses
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

			// Accuracy will be determined by finding imperfections in the player's solution
			const countIncorrectRuns = (hints, solution) => {
				// Initialise run ocounters
				let allRuns = 0;
				let incorrectRuns = 0;

				hints.forEach((hint, i) => {
					if (hint.length === 0) return;
					allRuns++; // Increment per cell

					if (hint.length !== solution[i].length) { // If incorrect length, automatic inaccuracy detection
						incorrectRuns++;
						return;
					}

					for (let j = 0; j < hint.length; j++) { // If correct length,
						if (Math.abs(hint[j]) !== solution[i][j]) { // if not matching with hints, detect inaccuracy
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
			} = countIncorrectRuns(hintsX, solutionX); // Horizontal
			const {
				allRuns: allRunsY,
				incorrectRuns: incorrectRunsY
			} = countIncorrectRuns(hintsY, solutionY); // Vertical

			let allRuns = allRunsX + allRunsY;
			let incorrectRuns = incorrectRunsX + incorrectRunsY;

			// Reverting marked (highlighted) cells
			markedCells.forEach(([y, x]) => state[y][x] = 9);

			let accuracy = (allRuns - incorrectRuns) / allRuns;
			let xp = round25((progress * accuracy) * maxXP);

			this.model.set({
				charmExperience: xp
			});
		},

		/**
		 * Converts a given amount of experience to a level.
		 * @param {Number} experience The experience of the player.
		 * @returns The level of the player. MAX for Level 100+, otherwise a number.
		 */
		expToLv: function (experience) {
			let playerPrestige = this.model.get('playerPrestige');

			let result = Math.floor(expCalcConstant * nthRoot(expCalcPower, (nthRoot((1 + (expCalcPrestigeFactor * playerPrestige)), experience) - expCalcBase))); // inverse of lvToExp (thanks maths class)
			if (Number.isNaN(result)) { // Dealing with 0 in maths is funnnnn
				result = 0;
			} else if (result >= 100) {
				return "MAX";
			} else if (this.lvToExp(result + 1) == experience) { // fix: achieving exact amount of xp needed when prestige > 0 would not level up
				result += 1;
			}
			return result;
		},


		/**
		 * Converts a level to its given experience requirement.
		 * @param {Number} level The level to convert.
		 * @returns The experience requirement.
		 */
		lvToExp: function (level) {
			let playerPrestige = this.model.get('playerPrestige');
			let result = round25((expCalcBase + (level / expCalcConstant) ** expCalcPower) ** (1 + (expCalcPrestigeFactor * playerPrestige)));
			return result;
		},

		/**
		 * Stores unclaimed XP into a buffer, proportionate to the player's progress and accuracy (when a charm is given up midway).
		 */
		storeExperience: function () {
			let progress = this.model.get('guessed') / this.model.get('total') * 100;
			let currentXPBuffer = this.model.get('playerExperienceBuffer');
			let charmExperience = this.model.get('charmExperience');

			if (progress > 100) progress = 10; // Punish over 100% progress
			progress = progress / 100;

			let progressAdjust = progress + 0.15; // Reward players who only give up late, still punishing to players who give up early
			progressAdjust = progressAdjust > 1 ? 1 : progressAdjust; // Don't allow give up bonus to exceed 100%

			let newXPbuffer = round25((charmExperience * progressAdjust) + currentXPBuffer);
			this.model.set({
				playerExperienceBuffer: newXPbuffer
			});
		},

		/**
		 * Apply all the experience from a completed charm and the XP buffer to the player.
		 */
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

		/**
		 * Converts prestige to its corresponding title.
		 * @param {*} nextLevelExperience The experience for the next level - used to check prestige eligibility.
		 */
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


			$('#prestige').text(romanize(playerPrestige)); // Style prestige number as roman numeral
			$('#prestigeTitle').text(prestigeToTitle(playerPrestige));

			if (nextLevelExperience == "MAX") {
				$('#prestigeExperience').prop('disabled', false); // Enable prestige button if eligible for prestige
			} else {
				$('#prestigeExperience').prop('disabled', true);
			}
		},

		/**
		 * Prestiges the player - removing the required XP, applying all buffered XP to the player, and incrementing the prestige level.
		 */
		prestigeExperience: function () {
			let playerPrestige = this.model.get('playerPrestige');
			this.applyExperience();
			let currentExperience = this.model.get('playerExperience');
			let prestigedExperience = currentExperience - this.lvToExp(100);

			this.model.set({
				playerExperience: prestigedExperience,
				playerPrestige: (playerPrestige + 1),
			});

			this.styleExperience();
		},

		/**
		 * Does the styling and text updating for all experience elements, including converting experience numbers to shorthand, displaying level titles.
		 */
		styleExperience: function () {
			let playerExperience = this.model.get('playerExperience');
			let level = this.expToLv(playerExperience);
			let nextLevelExperience;
			if (level == "MAX") {
				nextLevelExperience = "MAX"; // Prestige eligibility, next level requirement not needed as prestige augments value
			} else {
				nextLevelExperience = this.lvToExp(level + 1); // Next level XP requirement display
			}

			let bufferedExperience = this.model.get('playerExperienceBuffer');

			this.stylePrestige(nextLevelExperience);

			/**
			 * Converts a given player level to its corresponding title.
			 * @param {Number} level The player's level.
			 * @returns {String} The level title.
			 */
			function lvToTitle(level) {
				// Minimum and maximum level titles
				const titles = {
					0: "Clueless Cassia", // Just look at the app icon and you'll see what I mean
					"MAX": "True Logician" // What Senna wants to be, the world's best logician
				};

				const perFiveLevelsTitles = [
					// Reference list
					"Charms 101 Student", // Beginner class
					"Desk Sleeper", // What cassia always ends up doing in class, due to cosy corner
					"Graduate-to-be", // In alignment with cassia's goals, of graduating (with friends!!)
					"Connection Capturer", // Connection Magic charm + Cassia wants to have a connection with Senna
					"Amateur Illusionist", // Illusion magic, taught in Charms II
					"Adept Abstractor", // Abstractor is a professional who analyses data, hence analysing charms to solve them
					"Intermediate Imbuer", // Charms imbue an object with magic
					"Charmed Individual", // "Lucky individual" + "Charmed life" - Senna
					"Concentrated Learner", // "Places with a high concentration of magic" - Senna
					"Random Resolver", // "These questions are completely random..." -  Senna
					"Reliable Authority", // "Reliable as a friend" - Cassia
					"Diligent Tutor", // Senna tutors to the best of her ability
					"Fluent Painter", // "Fluid," hence fluent, pillars of magic
					"Proficient Artist", // Cassia bought into the myth that a witch's hair length improves their magic proficiency
					"Arithmagic Ace", // Senna's favourite class, see also Random Resolver
					"Wise Witch", // Senna's favoured familiar: owls, often seen as wise
					"Spell Scholar", // Senna wants (or rather needs) scholarships for her entry to Figwood
					"Charm Extraordinaire", // No reference in particular
					"Figwood Prodigy", // Figwood: top magic school for witches
					"Infinite Intellect" // "I do not have endless time" - infinite is a synonym for endless
				];

				if (titles.hasOwnProperty(level)) { // If minimum or maximum level
					return titles[level];
				} else if (typeof level === 'number' && level > 0) {
					let lvFiveIncrement = Math.floor(level / 5); // Apply new title every five levels
					return perFiveLevelsTitles[Math.min(lvFiveIncrement, perFiveLevelsTitles.length - 1)]; 
				}
			}

			// Format all experience values to their shorthand form
			playerExperience = nFormatter(playerExperience);
			if (nextLevelExperience != "MAX") {
				nextLevelExperience = nFormatter(nextLevelExperience);
			}
			bufferedExperience = nFormatter(bufferedExperience);

			// Get XP title
			let playerTitle = lvToTitle(level);

			
			// Convert charm XP values to shorthand
			let charmXPVal = this.model.get('charmExperience');
			let charmMaxXPVal = this.model.get('charmMaxExperience');

			charmXPVal = nFormatter(charmXPVal, 1);
			charmMaxXPVal = nFormatter(charmMaxXPVal, 1);


			// Update text values
			$('#playerLevel').text(level);
			$('#currentXP').text(playerExperience);
			$('#nextXP').text(nextLevelExperience);
			$('#bufferedXP').text(bufferedExperience);
			$('#XPTitle').text(playerTitle);
			$('#charm-exp').text(charmXPVal);
			$('#charm-max-exp').text(charmMaxXPVal);
		},

		/**
		 * Solves the given charm and changes relevant statistic logic.
		 */
		solve: function () {
			if (this.model.get('complete')) { // Don't trigger if puzzle already complete
				return;
			}

			$('#solve').prop('disabled', true); // Disable button to prevent accidental resolve (yes, two failsafes)
			let state = this.model.get('state');
			let hintsX = this.model.get('hintsX');
			let hintsY = this.model.get('hintsY');

			let perfect = this.model.isPerfect();

			// Convert perfect empty cells to crossouts
			for (let y = 0; y < state.length; y++) {
				for (let x = 0; x < state[y].length; x++) {
					if (state[y][x] == 0 && perfect) {
						state[y][x] = 1;
					}
				}
			}

			// Non-perfect statistic values
			let charmsPerfect = this.model.get('charmsPerfect');
			let perfectStreak = 0;

			if (perfect) { // Increment statistics if perfect
				charmsPerfect += 1;
				perfectStreak = this.model.get('perfectStreak') + 1;
			}

			let thisCharmsComplete = this.model.get('charmsComplete') + 1;

			let charmExhaustedID = this.model.get('seed'); // Set charm exhaustion ID to current charm to prevent XP farming

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
			this.applyExperience(); // Apply experience on solving, as opposed to buffering on giving up a charm
			/* checkAchievementCompletion.call(this); */

			this.render();
		},

		/**
		 * Determines the style for the sum of the hints for a given row/column.
		 * @param {Array} hints The hints for a given row/column.
		 * @param {*} dimension The dimension operating in (either row (charmWidth) or column (charmHeight)).
		 * @returns Styled HTML charm sum.
		 */
		charmSum: function (hints, dimension) {
			dimension = Number(dimension);
			// Initial sum attributes
			let sumTag = "strong";
			let sumClass = "smol";
			let tooltipText = "";
			let sumTooltip = "";


			let space = hints.reduce((acc, cur) => acc + Math.abs(cur), hints.length - 1); // Summation of hints

			let sumAbsoluteHints = hints.reduce((acc, cur) => acc + Math.abs(cur), 0);
			let absoluteHintSum = Math.abs(hints.reduce((acc, cur) => acc + cur, 0));

			if (sumAbsoluteHints == absoluteHintSum && Math.max(...hints) < 0) { // If all hints met, gray out and show complete symbol
				space = "✪"
				sumTag = "em";
				sumClass = ""; // Restore to normal size for width/height consistency
			} else {
				if (space == dimension) { // Full row/column can be filled, one possibility
					sumClass = "smol full tooltip";
					tooltipText = "Can complete row/column!";
				} else {
					let isPartial = false;
					let spaceDifference = dimension - space;
					hints.forEach(hint => { // Determine if possibility to fill out at least 1 tile from hints, see Wikipedia:Nonogram#Solving_techniques
						if (hint > spaceDifference) {
							isPartial = true;
						}
					});

					if (isPartial) { // Part of row/column can be filled, multiple possibilities
						sumClass = "smol partial tooltip";
						tooltipText = "Can partially complete row/column.";
					}
				}
			}

			// If there is a tooltip to display, wrap it in the necessary HTML
			if (tooltipText) {
				sumTooltip = `<span class="tooltiptext">${tooltipText}</span>`;
			}

			// The reusable structure for charm sum elements.
			return `<${sumTag} class="${sumClass}">${space}${sumTooltip}</${sumTag}>`
		},

		// Achievement crap, ignore for now
		/* sweetTreat: function () {
			let achievements = this.model.get('achievements');
			(achievements.find(achv => achv.id == "achv-SweetTreat")).completed = true;
			this.achievementHandler();
		}, */

		/* achievementHandler: function () {
			renderAchievements.call(this);
		}, */

		/**
		 * The main render function. Displays the puzzle, experience, hints, everything. (Yes, how descriptive. What do you expect?)
		 */
		render: function () {
			// Convert progress to percentage
			let progress = this.model.get('guessed') / this.model.get('total') * 100;
			$('#progress').text(progress.toFixed(1) + '%'); 

			if (this.model.get('darkMode')) {
				$('body').addClass('dark'); // Adds dark mode attribute to all elements with toggle on
			} else {
				$('body').removeClass('dark');
			}

			// Stats update
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

			// Experience update
			this.calculateExperience();
			this.styleExperience();

			if (this.model.get('complete')) { // Style puzzle on completion
				$('#solve').prop('disabled', true);
				$('#solve').text('Not quite...'); // Alternative banner to "You did it!"
				$('#puzzle').addClass('complete');
				if (this.model.get('perfect')) {
					$('#progress').addClass('done');
					$('#solve').text('You did it!'); // Referencing complete charm in original Charm Studies
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

			/**
			 * Determines the HTML all for column/row hints.
			 * @param {Array} hints The hints array to operate on.
			 * @param {Boolean} isEasyMode If easy mode is on (determines if charm sum is calculated).
			 * @param {*} dimension The dimension to measure with for index-based loops (either charmWidth or charmHeight).
			 * @returns The HTML element to assign hints text to.
			 */
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

					if (isEasyMode && !noSumMode) {
						processedHints.push(this.charmSum(hintArray, dimension));
					}
					return processedHints;
				});
			}

			if (this.model.get('easyMode') || this.model.get('complete')) { // Return crossout hints with easy mode / complete puzzles
				hintsXText = processHints.call(this, hintsX, true, charmWidth);
				hintsYText = processHints.call(this, hintsY, true, charmHeight);
			} else {
				hintsXText = processHints.call(this, hintsX, false, charmWidth);
				hintsYText = processHints.call(this, hintsY, false, charmHeight);
			}

			// Increment font size by 1 per power of 2 in streak, for funsies
			document.getElementById("perfectStreak").style.fontSize = (15 + Math.floor(Math.log2(this.model.get('perfectStreak') + 1))).toString() + "px";

			// Puzzle generation
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

			// Puzzle attributes calculations and setting
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

/**
 * Check if the brower supports localStorage - used to determine if save/load should be called.
 * @returns {Boolean} True if supported, else false.
 */
function localStorageSupport() {
	try {
		return 'localStorage' in window && window.localStorage !== null;
	} catch (e) {
		return false;
	}
}
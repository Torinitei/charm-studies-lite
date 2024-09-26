/**
 * Gets all the achievement data (only used as a unifying list to comply with DRY).
 * See `getDefaultAchievements` for player defaults and `getAchievementRequirements` for completion checking.
 * @returns {*} All achievements, keyed by Achievement ID.
 */
function getAchievementData() {
    /* default
    id: {
        progress: -1 for unused/untrackable (no-progressing tag), otherwise integer (0),
        requirements: -1 for unused / untrackable(no - progressing tag),
        completed: false by default,
        types: Array
    }
    */
    return {
        "achv-Welcome": {
            progress: -1,
            requirements: -1,
            completed: false,
            types: ["automatic", "no-progressing"]
        },
        "achv-SweetTreat": {
            progress: -1,
            requirements: -1,
            completed: false,
            types: ["easter-egg", "no-progressing"]
        },
        "achv-CharmsPerfect1": {
            progress: 0,
            requirements: 5,
            completed: false,
            types: ["charms-perfect"]
        }
    };
}

/**
 * Returns the default state of all achievements, to be provided to player on reset/first visit.
 * @returns {*} All achievements, with only their progress and completion state as attributes.
 */
function getDefaultAchievements() {
    const achievements = getAchievementData();
    return Object.keys(achievements).map(id => ({
        id: id,
        progress: achievements[id].progress,
        completed: achievements[id].completed
    }));
}

/**
 * Returns the requirements for all achievements, to be used in `checkAchievementCompletion`.
 * @returns {*} All achievements, with only their achievement types and requirements as attributes.
 */
function getAchievementRequirements() {
    const achievements = getAchievementData();
    return Object.keys(achievements).map(id => ({
        id: id,
        types: achievements[id].types,
        requirements: achievements[id].requirements
    }));
}

/**
 * Checks every achievement against its requirements for its achievements, with special handling for different achievement types.
 */
export function checkAchievementCompletion() {
    updateAchievementList.call(this, "render");
    let achievements = this.model.get('achievements');
    let achievementRequirements = getAchievementRequirements();

    achievements.forEach((achievement) => {
        if (achievement.completed) return;

        let requirement = achievementRequirements.find(req => req.id === achievement.id);
        let checkStat;

        if (requirement.types.includes("automatic")) {
            achievement.completed = true;
            return;
        } else if (requirement.types.includes("charms-perfect")) {
            checkStat = this.model.get("charmsPerfect");
            achievement.progress = checkStat;
            if (checkStat >= requirement.requirements) {
                achievement.completed = true;
            }
        }
    });

    this.model.set({
        achievements: achievements
    }, {
        silent: true
    });

    this.trigger('change')

}

/**
 * Adds new achievements to the player's list, if missing.
 * Typically used on updates.
 */
export function updateAchievementList(mode) {
    let achievements;
    if (mode == "render") {
        achievements = this.model.get('achievements');
    } else {
        achievements = this.get('achievements');
    }
    let defaultAchievements = getDefaultAchievements();

    if (achievements.length == defaultAchievements.length) return;

    defaultAchievements.forEach((element) => {
        if (!achievements.find(a => a.id === element.id)) achievements.push(element);
    });

    this.set({
        achievements: achievements
    }, {
        silent: true
    });

    this.trigger('change')
}

/**
 * Renders the achievements according to their completion.
 */
export function renderAchievements() {
    checkAchievementCompletion.call(this);
    let achievements = this.model.get('achievements');
    let achievementRequirements = getAchievementRequirements();

    achievements.forEach((achievement) => {
        let achvElement = document.getElementById(achievement.id);
        if (!achvElement) {
            console.error(`${achievement.id} element not found`);
            return;
        }

        let achvProgress = achvElement.getElementsByClassName("achievement-progress-bar")[0];
        let achvStatus = achvElement.getElementsByClassName("achievement-progress-status")[0];

        let requirement = achievementRequirements.find(req => req.id === achievement.id);

        if (achievement.completed) {
            achvElement.classList.add("done");
            achvStatus.innerHTML = "Done!";

            if (requirement.types.includes("no-progressing")) {
                achvProgress.setAttribute("value", "1");
                achvProgress.setAttribute("max", "1");
            } else {
                achvProgress.setAttribute("value", requirement.requirements);
                achvProgress.setAttribute("max", requirement.requirements);
            }

            return;
        }

        if (requirement.types.includes("no-progressing")) {
            achvProgress.setAttribute("value", "0");
            achvProgress.setAttribute("max", "1");
        } else {
            let progressText = achievement.progress.toString();
            let requirementText = requirement.requirements.toString();
            achvProgress.setAttribute("value", progressText);
            achvProgress.setAttribute("max", requirementText);
            achvStatus.innerHTML = `${progressText}/${requirementText}`;
        }
    });
}
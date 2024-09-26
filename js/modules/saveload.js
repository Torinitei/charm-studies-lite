let saveAttributes = [
    'picross2.dimensionWidth',
    'picross2.dimensionHeight',
    'picross2.state',
    'picross2.hintsX',
    'picross2.hintsY',
    'picross2.guessed',
    'picross2.total',
    'picross2.complete',
    'picross2.perfect',
    'picross2.seed',
    'picross2.darkMode',
    'picross2.easyMode',
    'charmStudiesLite.stats.perfectStreak',
    'charmStudiesLite.stats.charmsComplete',
    'charmStudiesLite.stats.charmsPerfect',
    'charmStudiesLite.stats.EXP.playerExperience',
    'charmStudiesLite.stats.EXP.playerExperienceBuffer',
    'charmStudiesLite.stats.EXP.playerPrestige',
    'charmStudiesLite.stats.EXP.charmExperience',
    'charmStudiesLite.stats.EXP.charmMaxExperience',
    'charmStudiesLite.timer.autoPauseMode',
    'charmStudiesLite.timer.timerDisplayMode',
    'charmStudiesLite.stats.EXP.charmExhaustedID',
    'charmStudiesLite.achievements'
]

let setAttributes = [
    'dimensionWidth',
    'dimensionHeight',
    'state',
    'hintsX',
    'hintsY',
    'guessed',
    'total',
    'complete',
    'perfect',
    'seed',
    'darkMode',
    'easyMode',
    'perfectStreak',
    'charmsComplete',
    'charmsPerfect',
    'playerExperience',
    'playerExperienceBuffer',
    'playerPrestige',
    'charmExperience',
    'charmMaxExperience',
    'autoPauseMode',
    'timerDisplayMode',
    'charmExhaustedID',
    'achievements'
]

function extractAttribute(dotSeparatedString) {
    var parts = dotSeparatedString.split('.');
    return parts[parts.length - 1];
}



export function exportSave() {
    navigator.clipboard.writeText(JSON.stringify(localStorage));
}

export function importSave() {
    let text = document.getElementById("inputSave").value;
    if (!text.length) {
        return;
    }
    let save;
    try {
        save = JSON.parse(text);
    } catch (error) {
        throw new Error("Invalid save!")
    }
    try {
        console.log(localStorage)
        for (const key in save) {
            if (saveAttributes.includes(key)) {
                console.log(key, extractAttribute(key))
                this.model.set(extractAttribute(key), JSON.stringify(save[key]))
            }
        }

        this.trigger('change');
        location.reload();
    } catch (error) {
        console.error(error);
        return;
    }
}
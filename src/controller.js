const lib = require('./lib');
const cons = require('./constants');

var controller = [];

const defaultSeqController = () => {
    var buttons = [];
    for(var i = 0; i < 8; i++){
        for (var j = 0; j < 8; j++){
            buttons[11 + i + (j * 10)] = [lib.sendFreeMidi];
        }
    }
    return buttons;
};

controller['seq'] = [];
controller['chords'] = [];
controller['seq'] = defaultSeqController(); // lib.sendFreeMidi is the default function of every button, later on overwriten by real functions
controller['seq'][cons.TEMPO_BUTTON] = [lib.changeTempo];
controller['seq'][cons.SHIFT_BUTTON] = [lib.toogleCursor];
controller['seq'][cons.SHIFT_2_BUTTON] = [lib.toogleCursor];
controller['seq'][cons.SHIFT_3_BUTTON] = [lib.toogleCursor];
controller['seq'][cons.RIGHT_ARROW_BUTTON] = [lib.shiftPatternRight, lib.randomPattern];
controller['seq'][cons.LEFT_ARROW_BUTTON] = [lib.shiftPatternLeft, lib.randomPattern];
controller['seq'][cons.UP_ARROW_BUTTON] = [lib.toogleSmallGridMode];
controller['seq'][cons.DOWN_ARROW_BUTTON] = [lib.toogleSmallGridMode];
controller['seq'][cons.MODE_BUTTON] = [lib.toogleMode];
controller['seq'][cons.CHANGE_WORKSPACE_BUTTON] = [lib.changeWorkspace];
controller['seq'][cons.PAGE_0_BUTTON] = [lib.changePage];
controller['seq'][cons.PAGE_1_BUTTON] = [lib.changePage];
cons.INNER_GRID.map(e => controller['seq'][e] = [lib.toogleNote]);
cons.SMALL_GRID.map(e => controller['seq'][e] = [lib.changeLength, lib.changeVelocity, lib.changeOctave,lib.globalChangeLength,lib.globalChangeVelocity]);
cons.SCENE_BUTTONS.map(e => controller['seq'][e] = [lib.changeScene,lib.copyScene,lib.chainScenes]);
cons.BIG_GRID.map(e => controller['seq'][e] = [lib.toogleStep,lib.showNotes,lib.changeTrackLength,lib.copyStep, lib.toogleTriplet, lib.toogleDoubleNote, lib.toogleSingleTriplet]);
cons.MUTE_BUTTONS.map(e => controller['seq'][e] = [lib.toogleMute,lib.changeTrack, lib.copyTrack]);
controller['chords'][cons.MODE_BUTTON] = [lib.toogleMode];
cons.CHORDS_GRID.map(e => controller['chords'][e] = [lib.toogleChords, lib.copyChord]);
controller['chords'][cons.CHANGE_CHORD_MODE_BUTTON] = [lib.changeChordMode];
cons.CHORD_PLAY_MODE_BUTTONS.map(e => controller['chords'][e] = [lib.changeChordPlayMode, lib.changeGlobalChordPlayMode]);
cons.CHORD_SCALE_BUTTONS.map(e => controller['chords'][e] = [lib.changeChordScale, lib.changeGlobalChordScale]);

module.exports = controller;

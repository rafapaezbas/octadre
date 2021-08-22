const lib = require('./lib');
const cons = require('./constants');

var networkController = [];

networkController['seq'] = [];
networkController['chords'] = [];
networkController['seq'][cons.TEMPO_BUTTON] = [lib.changeTempo];
networkController['seq'][cons.RIGHT_ARROW_BUTTON] = [lib.shiftPatternRight, lib.randomPattern];
networkController['seq'][cons.LEFT_ARROW_BUTTON] = [lib.shiftPatternLeft, lib.randomPattern];
networkController['seq'][cons.MODE_BUTTON] = [lib.toogleMode];
cons.INNER_GRID.map(e => networkController['seq'][e] = [lib.toogleNote]);
cons.SMALL_GRID.map(e => networkController['seq'][e] = [lib.changeLength, lib.changeVelocity, lib.changeOctave,lib.globalChangeLength,lib.globalChangeVelocity]);
cons.SCENE_BUTTONS.map(e => networkController['seq'][e] = [lib.copyScene]);
cons.BIG_GRID.map(e => networkController['seq'][e] = [lib.toogleStep,lib.changeTrackLength,lib.copyStep, lib.toogleTriplet, lib.toogleDoubleNote, lib.toogleSingleTriplet]);
cons.MUTE_BUTTONS.map(e => networkController['seq'][e] = [lib.toogleMute,lib.copyTrack]);
cons.GRID.map(e => networkController['chords'][e] = [lib.toogleChords]);
networkController['chords'][cons.CHANGE_CHORD_MODE_BUTTON] = [lib.changeChordMode];

module.exports = networkController;

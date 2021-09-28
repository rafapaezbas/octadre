const utils = require('./utils');

exports.TEMPO_BUTTON = 88
exports.SHIFT_BUTTON = 18
exports.SHIFT_2_BUTTON = 11
exports.SHIFT_3_BUTTON = 81
exports.LEFT_ARROW_BUTTON =  106
exports.RIGHT_ARROW_BUTTON =  107
exports.UP_ARROW_BUTTON =  104
exports.DOWN_ARROW_BUTTON =  105
exports.MODE_BUTTON =  111
exports.CHANGE_CHORD_MODE_BUTTON = 88
exports.CHANGE_WORKSPACE_BUTTON = 108
exports.PAGE_0_BUTTON = 109
exports.PAGE_1_BUTTON = 110


exports.COLOR_TRACK_1 = 29
exports.COLOR_TRACK_2 = 73
exports.COLOR_TRACK_3 = 81
exports.COLOR_TRACK_4 = 41
exports.COLOR_TRACK_5 = 52
exports.COLOR_TRACK_6 = 117
exports.COLOR_TRACK_7 = 112
exports.COLOR_TRACK_8 = 44
exports.COLOR_TRACK_9 = 78
exports.COLOR_TRACK_10 = 109
exports.COLOR_TRACK_11 = 77
exports.COLOR_TRACK_12 = 36
exports.COLOR_TRACK_13 = 49
exports.COLOR_TRACK_14 = 24
exports.COLOR_TRACK_15 = 108
exports.COLOR_TRACK_16 = 40

exports.COLOR_CURSOR = 10
exports.COLOR_ACTIVE_STEP = 3
exports.COLOR_ACTIVE_CHORD = 3
exports.COLOR_ACTIVE_SCENE = 3
exports.COLOR_ACTIVE_NOTE = 58
exports.COLOR_NON_ACTIVE_NOTE = 40
exports.COLOR_LENGTH = 8
exports.COLOR_VELOCITY = 116
exports.COLOR_OCTAVE = 16
exports.COLOR_BLINK = 58
exports.COLOR_TRIPLET = 116
exports.COLOR_DOUBLE_NOTE = 44

exports.COLOR_TONIC = 29
exports.COLOR_SUBDOMINANT = 81
exports.COLOR_DOMINANT = 41

exports.MUTE_BUTTONS = [89,79,69,59,49,39,29,19];
exports.SCENE_BUTTONS = [54,55,44,45];
exports.BIG_GRID = [14,23,32,41,51,62,73,84,85,76,67,58,48,37,26,15];
exports.INNER_GRID = [24,33,42,52,63,74,75,66,57,47,36,25];
exports.SMALL_GRID = [34,43,53,64,65,56,46,35];
exports.CHORD_PLAY_MODE_BUTTONS = [81,82,83,84,85,86];

exports.CHORD_SCALE_BUTTONS = [18,28,38,48,58,68];

exports.SCENE_STACK_LIMIT = 5

exports.MPC_MODE =  0
exports.GRID = utils.generateGrid();
exports.CHORDS_GRID = utils.generateChordGrid();

exports.CHORDS_MODE_ENABLED =  1
exports.TEST_MODE =  0
exports.TEST_MIDI_INPUT =  0

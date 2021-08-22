const utils = require('./utils');
const path = require('path');
const configFile = path.join(path.dirname(__dirname),'src','config','config.conf');
const configuration = utils.config(configFile);

exports.TEMPO_BUTTON = configuration.getIntOrDefault('TEMPO_BUTTON',88);
exports.SHIFT_BUTTON = configuration.getIntOrDefault('SHIFT_BUTTON',18);
exports.SHIFT_2_BUTTON = configuration.getIntOrDefault('SHIFT_2_BUTTON',11);
exports.SHIFT_3_BUTTON = configuration.getIntOrDefault('SHIFT_3_BUTTON',81);
exports.LEFT_ARROW_BUTTON = configuration.getIntOrDefault('LEFT_ARROW_BUTTON', 106);
exports.RIGHT_ARROW_BUTTON = configuration.getIntOrDefault('RIGHT_ARROW_BUTTON', 107);
exports.UP_ARROW_BUTTON = configuration.getIntOrDefault('UP_ARROW_BUTTON', 104);
exports.DOWN_ARROW_BUTTON = configuration.getIntOrDefault('DOWN_ARROW_BUTTON', 105);
exports.MODE_BUTTON = configuration.getIntOrDefault('MODE_BUTTON', 111);
exports.CHANGE_CHORD_MODE_BUTTON = configuration.getIntOrDefault('CHANGE_CHORD_MODE_BUTTON',88);
exports.CHANGE_WORKSPACE_BUTTON = configuration.getIntOrDefault('CHANGE_WORKSPACE_BUTTON',108);
exports.PAGE_0_BUTTON = configuration.getIntOrDefault('PAGE_0_BUTTON',109);
exports.PAGE_1_BUTTON = configuration.getIntOrDefault('PAGE_1_BUTTON',110);
exports.SHOW_BPM_BUTTON = configuration.getIntOrDefault('SHOW_BPM_BUTTON',28);


exports.COLOR_TRACK_1 = configuration.getIntOrDefault('COLOR_TRACK_1',29);
exports.COLOR_TRACK_2 = configuration.getIntOrDefault('COLOR_TRACK_2',73);
exports.COLOR_TRACK_3 = configuration.getIntOrDefault('COLOR_TRACK_3',81);
exports.COLOR_TRACK_4 = configuration.getIntOrDefault('COLOR_TRACK_4',41);
exports.COLOR_TRACK_5 = configuration.getIntOrDefault('COLOR_TRACK_5',52);
exports.COLOR_TRACK_6 = configuration.getIntOrDefault('COLOR_TRACK_6',117);
exports.COLOR_TRACK_7 = configuration.getIntOrDefault('COLOR_TRACK_7',112);
exports.COLOR_TRACK_8 = configuration.getIntOrDefault('COLOR_TRACK_8',44);
exports.COLOR_TRACK_9 = configuration.getIntOrDefault('COLOR_TRACK_9',78);
exports.COLOR_TRACK_10 = configuration.getIntOrDefault('COLOR_TRACK_10',109);
exports.COLOR_TRACK_11 = configuration.getIntOrDefault('COLOR_TRACK_11',77);
exports.COLOR_TRACK_12 = configuration.getIntOrDefault('COLOR_TRACK_12',36);
exports.COLOR_TRACK_13 = configuration.getIntOrDefault('COLOR_TRACK_13',49);
exports.COLOR_TRACK_14 = configuration.getIntOrDefault('COLOR_TRACK_14',24);
exports.COLOR_TRACK_15 = configuration.getIntOrDefault('COLOR_TRACK_15',108);
exports.COLOR_TRACK_16 = configuration.getIntOrDefault('COLOR_TRACK_16',40);

exports.COLOR_CURSOR = configuration.getIntOrDefault('COLOR_CURSOR',10);
exports.COLOR_ACTIVE_STEP = configuration.getIntOrDefault('COLOR_ACTIVE_STEP',3);
exports.COLOR_ACTIVE_CHORD = configuration.getIntOrDefault('COLOR_ACTIVE_CHORD',3);
exports.COLOR_ACTIVE_SCENE = configuration.getIntOrDefault('COLOR_ACTIVE_SCENE',3);
exports.COLOR_ACTIVE_NOTE = configuration.getIntOrDefault('COLOR_ACTIVE_NOTE',58);
exports.COLOR_NON_ACTIVE_NOTE = configuration.getIntOrDefault('COLOR_NON_ACTIVE_NOTE',40);
exports.COLOR_LENGTH = configuration.getIntOrDefault('COLOR_LENGTH',8);
exports.COLOR_VELOCITY = configuration.getIntOrDefault('COLOR_VELOCITY',116);
exports.COLOR_OCTAVE = configuration.getIntOrDefault('COLOR_OCTAVE',16);
exports.COLOR_BLINK = configuration.getIntOrDefault('COLOR_BLINK',58);
exports.COLOR_TRIPLET = configuration.getIntOrDefault('COLOR_TRIPLET',116);
exports.COLOR_DOUBLE_NOTE = configuration.getIntOrDefault('COLOR_DOUBLE_NOTE',44);

exports.COLOR_TONIC = configuration.getIntOrDefault('COLOR_TONIC',29);
exports.COLOR_SUBDOMINANT = configuration.getIntOrDefault('COLOR_SUBDOMINANT',81);
exports.COLOR_DOMINANT = configuration.getIntOrDefault('COLOR_DOMINANT',41);

exports.MUTE_BUTTONS = configuration.getArrayOrDefault('MUTE_BUTTONS',8,[89,79,69,59,49,39,29,19]);
exports.SCENE_BUTTONS = configuration.getArrayOrDefault('SCENE_BUTTONS',4,[54,55,44,45]);
exports.BIG_GRID = configuration.getArrayOrDefault('BIG_GRID',16,[14,23,32,41,51,62,73,84,85,76,67,58,48,37,26,15]);
exports.INNER_GRID = configuration.getArrayOrDefault('INNER_GRID',12,[24,33,42,52,63,74,75,66,57,47,36,25]);
exports.SMALL_GRID = configuration.getArrayOrDefault('SMALL_GRID',8,[34,43,53,64,65,56,46,35]);
exports.CHORD_PLAY_MODE_BUTTONS = configuration.getArrayOrDefault('CHORD_PLAY_MODE_BUTTONS',7,[81,82,83,84,85,86,87]);

exports.SCENE_STACK_LIMIT = configuration.getIntOrDefault('SCENE_STACK_LIMIT',5);

exports.MPC_MODE = configuration.getIntOrDefault('MPC_MODE', 0);
exports.GRID = utils.generateGrid();
exports.CHORDS_GRID = utils.generateChordGrid();

exports.CHORDS_MODE_ENABLED = configuration.getIntOrDefault('CHORDS_MODE_ENABLED', 0);
exports.TEST_MODE = configuration.getIntOrDefault('TEST_MODE', 0);
exports.TEST_MIDI_INPUT = configuration.getString('TEST_MIDI_INPUT', 0);

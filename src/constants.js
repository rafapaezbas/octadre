const utils = require('./utils');
const configuration = utils.config('config.conf');

exports.TEMPO_BUTTON = configuration.getIntOrDefault("TEMPO_BUTTON",88);
exports.SHIFT_BUTTON = configuration.getIntOrDefault("SHIFT_BUTTON",18);
exports.SHIFT_2_BUTTON = configuration.getIntOrDefault("SHIFT_2_BUTTON",11);
exports.LEFT_ARROW_BUTTON = configuration.getIntOrDefault("LEFT_ARROW_BUTTON", 106);
exports.RIGHT_ARROW_BUTTON = configuration.getIntOrDefault("RIGHT_ARROW_BUTTON", 107);

exports.COLOR_1 = configuration.getIntOrDefault("COLOR_1",26);
exports.COLOR_2 = configuration.getIntOrDefault("COLOR_2", 100);
exports.COLOR_3 = configuration.getIntOrDefault("COLOR_3", 77);
exports.COLOR_4 = configuration.getIntOrDefault("COLOR_4", 10);
exports.COLOR_5 = configuration.getIntOrDefault("COLOR_5", 80);
exports.COLOR_6 = configuration.getIntOrDefault("COLOR_6", 40);
exports.COLOR_7 = configuration.getIntOrDefault("COLOR_7", 7);
exports.COLOR_8 = configuration.getIntOrDefault("COLOR_8", 90);
exports.COLOR_9 = configuration.getIntOrDefault("COLOR_9", 4);
exports.COLOR_10 = configuration.getIntOrDefault("COLOR_10", 8);
exports.COLOR_11 = configuration.getIntOrDefault("COLOR_11", 19);
exports.COLOR_12 = configuration.getIntOrDefault("COLOR_12", 20);

exports.MUTE_BUTTONS = configuration.getArrayOrDefault("MUTE_BUTTONS",8,[89,79,69,59,49,39,29,19]);
exports.SCENE_BUTTONS = configuration.getArrayOrDefault("SCENE_BUTTONS",4,[54,55,44,45]);
exports.BIG_GRID = configuration.getArrayOrDefault("BIG_GRID",16,[14,23,32,41,51,62,73,84,85,76,67,58,48,37,26,15]);
exports.INNER_GRID = configuration.getArrayOrDefault("INNER_GRID",12,[24,33,42,52,63,74,75,66,57,47,36,25]);

exports.SCENE_STACK_LIMIT = configuration.getIntOrDefault("SCENE_STACK_LIMIT",5);

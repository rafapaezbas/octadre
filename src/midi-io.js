const utils = require('./utils');
const easymidi = require('easymidi');

const output = exports.output = new easymidi.Output(utils.getOutputPort(utils.arg("--midi-output")));
const clockInput = exports.clockInput = new easymidi.Input(utils.getInputPort(utils.arg("--midi-input")));
const launchpadOutput = exports.launchpadOutput = new easymidi.Output(utils.getLaunchpadPort(easymidi.getOutputs()))
const input = exports.input = new easymidi.Input(utils.getLaunchpadPort(easymidi.getInputs()));


exports.blinkButton = (button, firstColor, secondColor) => {
    var sysex = [];
    const header = [ 240, 00, 32, 41, 2, 24, 10 ];
    var message = sysex.concat(header).concat([button, firstColor]).concat([247]);
    launchpadOutput.send('sysex',message);

    setTimeout(() => {
        var sysex = [];
        var message = sysex.concat(header).concat([button, secondColor]).concat([247]);
        launchpadOutput.send('sysex',message);
    }, 200);

};

const utils = require('./utils');
const easymidi = require('easymidi');

var output = new easymidi.Output(easymidi.getOutputs()[0]);
var clockInput = new easymidi.Input(easymidi.getInputs()[0]);
var launchpadOutput = new easymidi.Output(utils.getLaunchpadPort(easymidi.getOutputs()));
var input = new easymidi.Input(utils.getLaunchpadPort(easymidi.getInputs()));

exports.launchpadOutput = launchpadOutput;
exports.input = input;

exports.setOutput = (port) => {
	output = new easymidi.Output(port);
};

exports.setClockInput = (port) => {
	clockInput = new easymidi.Input(port);
};

exports.getClockInput = () => {
	return clockInput;
};

exports.getOutput = () => {
	return output;
};

exports.resetClockInput = () => {
	clockInput.close();
};

exports.resetOutput = () => {
	output.close();
};

exports.blinkButton = (button, firstColor, secondColor) => {
	var sysex = [];
	const header = [ 240, 0, 32, 41, 2, 24, 10 ];
	var message = sysex.concat(header).concat([button, firstColor]).concat([247]);
	launchpadOutput.send('sysex',message);

	setTimeout(() => {
		var sysex = [];
		var message = sysex.concat(header).concat([button, secondColor]).concat([247]);
		launchpadOutput.send('sysex',message);
	}, 100);
};

exports.sendMidiCC = (button) => {
	output.send('cc', {controller: button, value: 127, channel:  0}); //Default value 127 and channel 0
};

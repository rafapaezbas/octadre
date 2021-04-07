const utils = require('./utils');
const easymidi = require('easymidi');
const cons = require('./constants')

var output;
var clockInput;
var launchpadOutput;
var input;

exports.setupIO = () => {

	try{
		output = new easymidi.Output(easymidi.getOutputs()[0]);
	}catch(err){
		return "Error: No output midi channels found.";
	}

	try{
		clockInput = new easymidi.Input(easymidi.getInputs()[0]);
	}catch(err){
		return "Error: No input midi channels found.";
	}

	try{
		launchpadOutput = new easymidi.Output(utils.getLaunchpadPort(easymidi.getOutputs()));
	}catch(err){
		return "Error: No Launchpad output midi channel found.";
	}

	try{
		console.log(cons.TEST_MIDI_INPUT);
		input = cons.TEST_MODE ? new easymidi.Input(cons.TEST_MIDI_INPUT) :  new easymidi.Input(utils.getLaunchpadPort(easymidi.getInputs()));
	}catch(err){
		return "Error: No Launchpad input midi channel found.";
	}

	 return ""
};

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

exports.getInput = () => {
	return input;
};

exports.getLaunchpadOutput = () => {
	return launchpadOutput;
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

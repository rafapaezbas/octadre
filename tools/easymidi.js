/*
 * This a a test bank to get how fast is sending individual midi message vs a single sysex message to light launchpad buttons.
 * Launchpad midi input could be a bottleneck if many midi message are sent individually, but there is the possibility of sending
 * a single sysex message with every button and color you want in the launchpad.
 */
var easymidi = require('easymidi');
var midi = require('midi');

var outputs = easymidi.getOutputs();
var inputs = easymidi.getInputs();
console.log("outputs");
console.log(outputs);
console.log("inputs");
console.log(inputs);

var generateSysexMessage = (buttons) => {
	var header = [ 240, 00, 32, 41, 2, 24,10 ];
	var sysexMessage = buttons.reduce((message,button) => {
		message.push(button[0]); //button
		message.push(button[1]); //color
		return message;

	}, header);
	sysexMessage.push(247);
	return sysexMessage;
}

const launchpadOutput = new midi.Output();
launchpadOutput.openPort(1);

var arr = [...Array(40)].map((item, index) => index); //[0,1,2...15];
var randomColor = Math.floor((Math.random() * 127) + 1)
var randomColor2 = Math.floor((Math.random() * 127) + 1)


for(var i = 0; i < 20; i++){
	console.time("sysex");
	launchpadOutput.sendMessage(generateSysexMessage(arr.map(e => [e + 11, randomColor])));
	console.timeEnd("sysex");

	console.time("midi");
	arr.map(e => launchpadOutput.sendMessage([144,e + 51,randomColor2]));
	console.timeEnd("midi");

}


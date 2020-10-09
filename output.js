const midi = require('midi');
 
// Set up a new output.
const output = new midi.Output();
 
// Count the available output ports.
console.log(output.getPortCount());
 
// Get the name of a specified output port.
console.log(output.getPortName(4));
 
// Open the first available output port.
output.openPort(4);
 
// Send a MIDI message.
output.sendMessage([176,22,1]);
 
// Close the port when done.
output.closePort();
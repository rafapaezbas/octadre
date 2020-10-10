var easymidi = require('easymidi');

/*
var output = new easymidi.Output('loopMIDI Port 3 5');
output.send('noteon', {
  note: 64,
  velocity: 127,
  channel: 3
});
*/

var outputs = easymidi.getOutputs();
var inputs = easymidi.getInputs();
console.log("outputs");
console.log(outputs);
console.log("inputs");
console.log(inputs);
const easymidi = require('easymidi');
var output = new easymidi.Output("Midi Through:Midi Through Port-0 14:0");

setInterval(() => {
    var note = Math.floor(Math.random() * 127);
    var velocity = Math.floor(Math.random() * 127);
    console.log("Sending note: " + note + " and velocity: " + velocity);
    output.send('noteon', {note: note ,velocity: velocity,channel: 0});
},100);

const easymidi = require('easymidi');

var output = new easymidi.Output("Midi Through:Midi Through Port-0 14:0");
var time = 0;

const test = (test,description) => {
    time += 1000;
    setTimeout(() => console.log(description), time);
    time += 1000;
    setTimeout(() => test(), time);
}

test(() => {
    output.send('noteon', {note: 14 ,velocity: 127,channel: 0});
    output.send('noteon', {note: 14 ,velocity: 0,channel: 0});
}, "Testing step 0 turn on.");

test(() => {
    output.send('noteon', {note: 14 ,velocity: 127,channel: 0});
    output.send('noteon', {note: 14 ,velocity: 0,channel: 0});
}, "Testing step 0 turn off");

test(() => {
    output.send('noteon', {note: 24 ,velocity: 127,channel: 0});
    output.send('noteon', {note: 24 ,velocity: 0,channel: 0});
}, "Testing step 0 note 0 turn off");

test(() => {
    output.send('noteon', {note: 24 ,velocity: 127,channel: 0});
    output.send('noteon', {note: 24 ,velocity: 0,channel: 0});
}, "Testing step 0 note 0 turn on");

test(() => {
    output.send('noteon', {note: 18 ,velocity: 127,channel: 0});
    output.send('noteon', {note: 89 ,velocity: 127,channel: 0});
    output.send('noteon', {note: 89 ,velocity: 0,channel: 0});
    output.send('noteon', {note: 18 ,velocity: 0,channel: 0});
}, "Testing mute track 1");

test(() => {
    output.send('noteon', {note: 18 ,velocity: 127,channel: 0});
    output.send('noteon', {note: 89 ,velocity: 127,channel: 0});
    output.send('noteon', {note: 89 ,velocity: 0,channel: 0});
    output.send('noteon', {note: 18 ,velocity: 0,channel: 0});
}, "Testing unmute track 1");

test(() => {
    output.send('noteon', {note: 79 ,velocity: 127,channel: 0});
    output.send('noteon', {note: 79 ,velocity: 0,channel: 0});
}, "Testing change to track 2");

test(() => {
    output.send('noteon', {note: 14 ,velocity: 127,channel: 0});
    output.send('noteon', {note: 23 ,velocity: 127,channel: 0});
    output.send('noteon', {note: 14 ,velocity: 0,channel: 0});
    output.send('noteon', {note: 23 ,velocity: 0,channel: 0});
}, "Testing triplet on in step 0 and step 1");

test(() => {
    output.send('noteon', {note: 14 ,velocity: 127,channel: 0});
    output.send('noteon', {note: 23 ,velocity: 127,channel: 0});
    output.send('noteon', {note: 14 ,velocity: 0,channel: 0});
    output.send('noteon', {note: 23 ,velocity: 0,channel: 0});
}, "Testing triplet off in step 0 and step 1");

test(() => {
    output.send('noteon', {note: 55 ,velocity: 127,channel: 0});
    output.send('noteon', {note: 55 ,velocity: 127,channel: 0});
}, "Testing change of scene");

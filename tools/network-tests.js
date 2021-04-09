const io = require('socket.io-client');
const socket = io('http://pinkumandrill.com:5000');

// Receive id after connetion
socket.on("id", (msg) => {
    console.log(msg);
});

socket.on("event", (msg) => {
    console.log(msg);
});

socket.emit("pair", "TOZk22FLwteWFjZHAAAJ");

setTimeout(() => {
    console.log("emit event");
    socket.emit("event", { pressedButtons: [14],
                           currentTrack: 0,
                           currentScene: 0,
                           lastPressedStep: 0,
                           lastChordPressed: 0,
                           mode: 'seq',
                           smallGridMode: 'length',
                           workspace: 2 });

}, 5000);

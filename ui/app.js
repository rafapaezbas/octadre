const { remote } = require('electron');
const { BrowserWindow } = remote;
const easymidi = remote.require('easymidi');
const init = remote.require('../src/init');
const io = remote.require('../src/midi-io');

const midiInputs = document.getElementById("midi-inputs");
easymidi.getInputs().map(e => {
    var midiInput = document.createElement("option");
    midiInput.innerHTML = e;
    midiInputs.appendChild(midiInput);
});

const midiOutputs = document.getElementById("midi-outputs");
easymidi.getOutputs().map(e => {
    var midiOutput = document.createElement("option");
    midiOutput.innerHTML = e;
    midiOutputs.appendChild(midiOutput);
});

midiInputs.addEventListener('change', (e) => {
    io.resetClockInput();
    init.setupClockInput(e.target.value);
});

midiOutputs.addEventListener('change', (e) => {
    io.resetOutput();
    io.setOutput(e.target.value);
});

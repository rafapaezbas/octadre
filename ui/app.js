const { remote } = require('electron');
const { BrowserWindow } = remote;
const easymidi = remote.require('easymidi');

const midiInputs = document.getElementById("midi-inputs");
easymidi.getInputs().map(e => {
    var midiInput = document.createElement("option");
    midiInput.innerHTML = e;
    midiInputs.appendChild(midiInput);
});

const midiOutputs = document.getElementById("midi-outputs");
easymidi.getInputs().map(e => {
    var midiOutput = document.createElement("option");
    midiOutput.innerHTML = e;
    midiOutputs.appendChild(midiOutput);
});

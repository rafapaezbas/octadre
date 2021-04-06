const { remote } = require('electron');
const { BrowserWindow } = remote;
const easymidi = remote.require('easymidi');
const init = remote.require('../src/init');
const io = remote.require('../src/midi-io');
const network = remote.require('../src/network');

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

var ioError = init.getIOError();
if(ioError != ""){
    document.getElementById("log").innerHTML = ioError;
}

document.getElementById("save").addEventListener('click', async (e) => {
    const file = await remote.dialog.showSaveDialog({ defaultPath: "/" });
    if(file){
        init.save(file.filePath);
    }
});

document.getElementById("load").addEventListener('click', async (e) => {
    const file = await remote.dialog.showOpenDialog({properties:['openFile']});
    if(file){
        init.load(file.filePaths[0]);
    }
});

document.getElementById("metronome").addEventListener('click', (e) => {
    init.toogleMetronome();
});

document.getElementById("network").addEventListener('click', (e) => {
    switchPannels();
    if(!network.getNetwork().connected){
        document.getElementById("log").innerHTML = "Click here to connect."
        document.getElementById("log").classList.add("log-clickable");
    }
});

document.getElementById("log").addEventListener('click', async (e) => {
    if(!network.getNetwork().connected){
        var server = document.getElementById("server-ip").value;
        var pair = document.getElementById("pair-id").value;
        var response;
        document.getElementById("log").innerHTML = "Connecting...";
        try{
            response = await network.connect(server,pair);
        }catch(err){
            response = err;
        }
            document.getElementById("log").classList.remove("log-clickable");
            document.getElementById("log").innerHTML = response;
    }
});

const switchPannels = () => {
    document.getElementById("panel1").classList.toggle("panel1-in");
    document.getElementById("panel1").classList.toggle("panel1-out");
    document.getElementById("panel2").classList.toggle("panel2-in");
    document.getElementById("panel2").classList.toggle("panel2-out");
};

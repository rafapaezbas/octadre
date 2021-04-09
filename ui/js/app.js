const { remote } = require('electron');
const { BrowserWindow } = remote;
const easymidi = remote.require('easymidi');
const init = remote.require('../src/init');
const io = remote.require('../src/midi-io');
const network = remote.require('../src/network');

var connection = undefined;

var ioError = init.getIOError();
if(ioError != ""){
    document.getElementById("log").innerHTML = ioError;
}


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

const showNetwork = () => {
    document.getElementById("panel1").classList.remove("panel1-in");
    document.getElementById("panel1").classList.add("panel1-out");
    document.getElementById("panel2").classList.add("panel2-in");
    document.getElementById("panel2").classList.remove("panel2-out");
    document.getElementById("network").classList.add("icon-selected");
    document.getElementById("midi").classList.remove("icon-selected");
    if(!network.getNetwork().connected){
        document.getElementById("log").innerHTML = "Click here to connect."
        document.getElementById("log").classList.add("log-clickable");
    }else{
        document.getElementById("log").innerHTML = connection;
    }
};

const showMidi = () => {
    document.getElementById("panel1").classList.add("panel1-in");
    document.getElementById("panel1").classList.remove("panel1-out");
    document.getElementById("panel2").classList.remove("panel2-in");
    document.getElementById("panel2").classList.add("panel2-out");
    document.getElementById("midi").classList.add("icon-selected");
    document.getElementById("network").classList.remove("icon-selected");
    document.getElementById("log").innerHTML = ""
    document.getElementById("log").classList.remove("log-clickable");
};

midiInputs.addEventListener('change', (e) => {
    io.resetClockInput();
    init.setupClockInput(e.target.value);
});

midiOutputs.addEventListener('change', (e) => {
    io.resetOutput();
    io.setOutput(e.target.value);
});

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

document.getElementById("network").addEventListener('click', showNetwork);

document.getElementById("midi").addEventListener('click', showMidi);

document.getElementById("log").addEventListener('click', async (e) => {
    if(!network.getNetwork().connected){
        var server = document.getElementById("server-ip").value;
        var pair = document.getElementById("pair-id").value;
        var response;
        document.getElementById("log").innerHTML = "Connecting...";
        document.getElementById("log").classList.remove("log-clickable");
        try{
            response = await network.connect(server,pair);
            connection = "&#9745; " + response;
            document.getElementById("log").innerHTML = connection;
        }catch(err){
            response = err;
            document.getElementById("log").innerHTML = "&#9746; Error: " + err + " Click here to retry.";
            document.getElementById("log").classList.add("log-clickable");
        }
    }
});


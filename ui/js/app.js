const { remote } = require('electron');
const { BrowserWindow } = remote;
const easymidi = remote.require('easymidi');
const init = remote.require('../src/init');
const io = remote.require('../src/midi-io');
const network = remote.require('../src/network');

//Actions -------------------------

const save = (state, event) => {
    remote.dialog.showSaveDialog({ defaultPath: "/" }).then((file,err) => {
        if(file && file.filePath.length != 0){
            init.save(file.filePath);
        }
    })
    return {...state};
};

const load = (state, event) => {
    remote.dialog.showOpenDialog({properties:['openFile']}).then(file => {
        if(file && file.filePath.length != 0){
            init.load(file.filePaths[0]);
        }
    });
    return {...state};
};

const setupClockInput = (state,event) => {
    return [state,
            [
                () => {
                    io.resetClockInput();
                    init.setupClockInput(event.target.value);
                }
            ]
           ];
};

const setupOutput = (state,event) => {
    return [state,
            [
                () => {
                    io.resetOutput();
                    io.setOutput(event.target.value);
                }
            ]
           ];
};

const switchPanel = (panel) => {
    return (state,event) => {
        return ({
            ...state,
            panel: panel
        });
    };
};

const connect = (state) => {
    return [
        {...state, connecting: true},
        [(dispatch, state) => {
            network.connect(state.server, state.pair)
                .then(result => dispatch(() => ({...state, serverConnection: result, connecting: false, connected : true}), state))
                .catch(err => dispatch(() => ({...state, connecting: false, serverError: err}), state));
        }, state]
    ]
};

const isLogClickable = (state) => {
    return state.panel == "network" && !state.connected && !state.connecting && state.ioError == undefined;
}

const logMessage = (state) =>  {
    var log = "";
    if(state.panel == "network" && !state.connected)
        log = "Click here to connect";
    if(state.panel == "network" && state.serverConnection != undefined)
        log = state.serverConnection;
    if(state.panel == "network" && state.serverError != undefined)
        log = state.serverError + " Click here to retry";
    if(state.connecting)
        log = "Connecting";
    if(state.ioError)
        log = state.ioError;
    return log;
};

const updateServer = (state,event) => ({...state, server: event.target.value})
const updatePair = (state,event) => ({...state, pair: event.target.value})

// Views ----------------------------------

app({
    init: { panel : "midi", connected: false, connecting: false, server: "3.64.53.184", pair: undefined, ioError: init.getIOError(), serverError: undefined, serverConnection: undefined },
    view: state =>
        h("main", {}, [
            ...icons,
            log(state),
            fieldset(state)
        ]),
    node: document.getElementById("app"),
});


const icons = [
    h("img", {src : "images/floppy-disk.png", id:"save", onclick: save}),
    h("img", {src : "images/load.png", id:"load", onclick: load}),
    h("img", {src : "images/metronome.png", id :"metronome"}),
    h("img", {src : "images/midi.png", id:"midi", onclick: switchPanel("midi")}),
    h("img", {src : "images/network.png", id:"network", onclick: switchPanel("network")})
];

const log = (state) => h("p", {id: "log", class: isLogClickable(state) ? "log-clickable" : "", onclick: isLogClickable(state) ? connect : undefined}, text(logMessage(state)));

const fieldset = (state) => {
    return h("fieldset", {}, [
        h("legend", {}, text("Octaedre")),
        midiPanel(state),
        networkPanel(state)
    ]);
};

const midiPanel = (state) => {
    return h("div", {id : "panel1",class : state.panel == "midi" ? "panel1-in": "panel1-out"} ,[
        h("div", {class : "row"}, [
            h("label", {}, text("Clock Input")),
            h("select", {id : "midi-inputs", onchange : setupClockInput}, midiPorts(easymidi.getInputs()))
        ]),
        h("div", {class : "row"}, [
            h("label", {}, text("Midi output")),
            h("select", {id : "midi-outputs", onchange: setupOutput}, midiPorts(easymidi.getOutputs()))
        ]),
    ]);
};

const networkPanel = (state) => {
    return h("div", {id : "panel2" , class : state.panel == "network" ? "panel2-in": "panel2-out"}, [
        h("div", {class : "row"}, [
            h("label", {}, text("Network server")),
            h("input", {id : "server-ip", type : "text", value: state.server, oninput : updateServer})
        ]),
        h("div", {class : "row"}, [
            h("label", {}, text("Pair ID")),
            h("input", {id : "pair-id", type : "text", value: state.pair, oninput: updatePair})
        ]),
    ]);
};

const midiPorts = (inputs) => {
    return inputs.map(e => h("option",{}, text(e)));
};

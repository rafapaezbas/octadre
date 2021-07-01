const hyperswarm = require('hyperswarm');
const crypto = require('crypto');
var eventCallback = undefined;

var network = {
    connected : false,
    paired : false,
    id : undefined,
    socket : undefined,
}

const swarm = hyperswarm({
  announceLocalAddress: true
})

exports.connect = (key) => {

    return new Promise((resolve,reject) => {

        const hashedKey = crypto.createHash("sha256").update(key).digest();
        swarm.join(hashedKey,{ announce: true,lookup: true }, () => {});
        swarm.on("connection", (socket, info) => {
            socket.write(hashedKey);
            socket.on("data",(data) => {
                if(data.toString() == hashedKey){
                    network.socket = socket;
                    network.connected = true;
                    resolve("Connected");
                }
            });
        });

        setTimeout(() => reject("Connection timeout."), 60000);

    });
};

exports.send = (state) => {
    network.socket.write(JSON.stringify(stateTransformer(state)));
};

exports.getNetwork = () => {
    return network;
};

exports.setEventCallback = (callback) => {
    eventCallback = callback;
};

//This is the information sent over socket
const stateTransformer = (state) => {
    return {
        pressedButtons:state.pressedButtons,
        currentTrack:state.currentTrack,
        currentScene:state.currentScene,
        lastPressedStep:state.lastPressedStep,
        lastChordPressed: state.lastChordPressed,
        mode : state.mode,
        smallGridMode : state.smallGridMode,
        workspace : state.workspace,
    };
}

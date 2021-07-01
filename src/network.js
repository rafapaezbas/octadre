const hyperswarm = require('hyperswarm');
const crypto = require('crypto');
const {Writable, Readable} = require('readable-stream')

var network = {
    connected : false,
    cb : undefined
}

const rs = Readable({
    read: (size) => {
        return true;
    }
})

const ws = Writable({
    write(chunk, encoding, callback){
        try{
            network.cb(JSON.parse(chunk))
        }catch(err){
            console.log(err);
        }
        callback();
    }
});


const swarm = hyperswarm({
    announceLocalAddress: true
})

exports.connect = (key) => {

    return new Promise((resolve,reject) => {

        const hashedKey = crypto.createHash("sha256").update(key).digest();
        const topic = crypto.createHash("sha256").update("octaedre_network").digest();

        swarm.join(topic,{ announce: true,lookup: true }, () => {});
        swarm.on("connection", (socket, info) => {
            socket.write(hashedKey);
            socket.on("data",(data) => {
                if(data.toString() == hashedKey && !network.connected){
                    rs.pipe(socket).pipe(ws);
                    network.connected = true;
                    resolve("Connected");
                }
            });
        });

        setTimeout(() => reject("Connection timeout."), 60000);

    });
};

exports.send = (state) => {
    rs.push(JSON.stringify(stateTransformer(state)));
};

exports.getNetwork = () => {
    return network;
};

exports.setEventCallback = (callback) => {
    network.cb = callback;
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

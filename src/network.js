const Hyperswarm = require('hyperswarm')
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
            var chunks = chunk.toString().split("|");
            chunks.pop(); //remove last empty element
            chunks.map(c => network.cb(JSON.parse(c)));
        }catch(err){
            console.log(err);
        }
        callback();
    },
});


const swarm = new Hyperswarm()


exports.connect = (key) => {

    return new Promise((resolve,reject) => {

        const hashedKey = crypto.createHash("sha256").update(key).digest();

        swarm.join(hashedKey,{ announce: true,lookup: true }, () => {});
        swarm.on("connection", (socket, info) => {
            if(info.peer != undefined && !network.connected){
                rs.pipe(socket).pipe(ws);
                network.connected = true;
                resolve("Connected");
            }
        });

        setTimeout(() => reject("Connection timeout."), 60000);
    });

};

exports.send = (state) => {
    // Because of arbitrary chunk size sent, | acts as a separator between different chunks, see Writable stream where chunks are splited by |
    rs.push(JSON.stringify(stateTransformer(state)) + "|");
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

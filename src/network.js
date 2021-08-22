const Hyperswarm = require('hyperswarm')
const crypto = require('crypto');
const {Transform, Writable, Readable} = require('readable-stream')

var network = {
    connected : false,
    cb : undefined
}

const rs = Readable({
    read: (size) => {
        return true;
    },
    objectMode : true
})

const ws = Writable({
    write(chunk, encoding, callback){
        try{
            var chunks = chunk.toString().split("|");
            chunks.pop(); //remove last empty element
            chunks.map(c => network.cb(decode(JSON.parse(c))));
        }catch(err){
            console.log(err);
        }
        callback();
    },
});

const encoder = Transform({
    transform(state,encoding,callback){
        message = [];
        const keys = ['pressedButtons','currentTrack', 'currentScene', 'lastPressedStep', 'lastChordPressed', 'mode', 'smallGridMode', 'workspace']
        keys.map(k => message.push(state[k]))
        // Because of arbitrary chunk size sent, | acts as a separator between different chunks, see Writable stream where chunks are splited by |
        this.push(JSON.stringify(message) + '|')
        callback(null)
    },
    objectMode : true
})

const decode = (message) => {
    const keys = ['pressedButtons','currentTrack', 'currentScene', 'lastPressedStep', 'lastChordPressed', 'mode', 'smallGridMode', 'workspace']
    const state = {};
    keys.forEach((k,i) => state[k] = message[i]);
    return state;
};

const swarm = new Hyperswarm()


exports.connect = (key) => {

    return new Promise((resolve,reject) => {

        const hashedKey = crypto.createHash("sha256").update(key).digest();

        swarm.join(hashedKey,{ announce: true,lookup: true }, () => {});
        swarm.on("connection", (socket, info) => {
            if(!network.connected){
                rs.pipe(encoder).pipe(socket).pipe(ws);
                network.connected = true;
                resolve("Connected");
            }
        });

        setTimeout(() => reject("Connection timeout."), 60000);
    });

};

exports.send = (state) => {
    rs.push(state);
};

exports.getNetwork = () => {
    return network;
};

exports.setEventCallback = (callback) => {
    network.cb = callback;
};

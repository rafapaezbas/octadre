const io = require('socket.io-client');

var network = {
    connected : false,
    paired : false,
    id : undefined,
    socket : undefined,
}


exports.connect = (server,pair) => {

    return new Promise((resolve,reject) => {

        network.socket = io('http://' + server + ':5000');

        // Receive id after connetion
        network.socket.on('id', (msg) => {
            network.id = msg;
        });

        network.socket.on('event', (msg) => {
            console.log(msg);
        });

        network.socket.on('paired', (msg) => {
            network.paired = true;
            resolve("Succesfull pairing: " + network.socket.id);
        });

        network.socket.on('not-paired', (msg) => {
            network.paired = false;
            reject("Pairing failed: " + msg);
        });

        // Socket connection established
        network.socket.on('connect', () => {
            network.connected = true;
            if(pair == undefined || pair.length == 0){
                resolve("Successful connection:" + network.socket.id);
            }else{
                network.socket.emit("pair", pair);
            }
        });

        setTimeout(() => reject("Connection timeout."), 10000);

    });
};

exports.getNetwork = () => {
    return network;
}

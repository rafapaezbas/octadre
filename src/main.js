const init = require('./init');
const ui = require('./ui');

var ioError = init.setupIO();

if(ioError == undefined){ // Check if io could be setup
    init.setupState();
    init.setupScenes();
    init.setupClockInput();
    init.setupLaunchpadInput();
    init.setupNetworkController();
    init.render();
}

ui.setupUI();

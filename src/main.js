const init = require('./init');
const ui = require('./ui');

init.setupState();
init.setupScenes();
init.setupController();
init.setupClockInput();
init.setupLaunchpadInput();
init.render();
ui.setupUI();

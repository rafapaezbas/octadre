const midi = require('midi');

const launchpadOutput = new midi.Output();
const externalOutput = new midi.Output();
const input = new midi.Input();

const bigGrid = [14,23,32,41,51,62,73,84,85,76,67,58,48,37,26,15];
const CHANGE_TRACK_BUTTON = 11;
const CHANGE_MUTE_BUTTON = 89;
const SPEED_UP_BUTTON = 104;
const SPEED_DOWN_BUTTON = 105;

const GREEN = 26;
const YELLOW = 100;
const BLUE = 77;
const ORANGE = 10;
const PURPLE = 80;
const WHITE = 40;

const tracks = [];
tracks[0] = {grid:bigGrid, pattern:[], midi:22, color: GREEN, muted: false };
tracks[1] = {grid:bigGrid, pattern:[], midi:23, color: PURPLE, muted: false };
tracks[2] = {grid:bigGrid, pattern:[], midi:24, color: BLUE, muted: false };
tracks[3] = {grid:bigGrid, pattern:[], midi:25, color: WHITE, muted: false };


var currentStep = 0;
var currentTrack = 0;
var speed = 150;

tracks.map(t => {
	for(var i = 0; i < 16; i++){
		t.pattern.push(false);
	}
});

externalOutput.getPortCount();
externalOutput.getPortName(0);
externalOutput.openPort(0);

launchpadOutput.getPortCount();
launchpadOutput.getPortName(1);
launchpadOutput.openPort(1);

input.getPortCount();
input.getPortName(1);
input.openPort(1);
input.ignoreTypes(false, false, false);

input.on('message', (deltaTime, message) => {
	var pressed = message[2] == 127;
	var button = message[1];
	if(pressed && controller[button] != undefined){
		controller[button](button);
	}
});

const lightButton = (button,color) => {
	launchpadOutput.sendMessage([ 144, button, color ]);
}

const resetAll = () => {
	for(var i = 0; i < 200; i ++){
		lightButton(i,0);
	}
}

const lightStep = (step,color) => {
	lightButton(tracks[currentTrack].grid[step], color);
}

const toogleStep = (button) => {
	var trackColor = tracks[currentTrack].color;
	var step = tracks[currentTrack].grid.indexOf(button);
	if(step != -1){
		tracks[currentTrack].pattern[step] = !tracks[currentTrack].pattern[step]; 
		tracks[currentTrack].pattern[step] ? lightStep(step,YELLOW) : lightStep(step,trackColor);
	}
}


const resetStep = (step) => {
	var trackColor = tracks[currentTrack].color;
	tracks[currentTrack].pattern[step] ? lightStep(step,YELLOW) : lightStep(step,trackColor);
}

const resetGrid = () => {
	for(var i = 0; i < tracks[currentTrack].grid.length;i++){
		resetStep(i);
	}
}

const resetMute = () => {
	if(tracks[currentTrack].muted){
		lightButton(CHANGE_MUTE_BUTTON,PURPLE);
	}else{
		lightButton(CHANGE_MUTE_BUTTON,GREEN);
	}
}

const changeTrack = (button) => {
	currentTrack = (currentTrack + 1) % tracks.length;
	resetGrid();
	resetMute();
}

const toogleMute = (button) => {
	tracks[currentTrack].muted = !tracks[currentTrack].muted;
	resetMute();
}

const changeSpeed = (button) => {
	if(button == SPEED_DOWN_BUTTON){
		speed += 10;
	}
	if(button == SPEED_UP_BUTTON){
		speed -= 10;
	}
	console.log(speed);
}

const resetSpeed = () => {
	lightButton(SPEED_UP_BUTTON,WHITE);
	lightButton(SPEED_DOWN_BUTTON,WHITE);
}

const tick = () => {
	setTimeout(function() {
		resetStep((currentStep - 1) % 16);
		lightStep(currentStep % 16, ORANGE);
		tracks.map(t => {
			if(t.pattern[currentStep % 16] && !t.muted){
				externalOutput.sendMessage([176,t.midi,1]);
			}
		});
		currentStep++;
		tick();
	}, speed);
}


var controller = [];
controller[CHANGE_TRACK_BUTTON] = changeTrack;
controller[CHANGE_MUTE_BUTTON] = toogleMute;
controller[SPEED_DOWN_BUTTON] = changeSpeed;
controller[SPEED_UP_BUTTON] = changeSpeed;
bigGrid.map(e => controller[e] = toogleStep);

resetAll();
resetSpeed();
resetMute();
resetGrid();
tick();

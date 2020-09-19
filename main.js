const midi = require('midi');

const launchpadOutput = new midi.Output();
const externalOutput = new midi.Output();
const input = new midi.Input();

const bigGrid = [14,23,32,41,51,62,73,84,85,76,67,58,48,37,26,15];
const innerGrid = [24,33,42,52,63,74,75,66,57,47,36,25];

const CHANGE_TRACK_BUTTON = 11;
const SPEED_UP_BUTTON = 104;
const SPEED_DOWN_BUTTON = 105;
const MUTE_0_BUTTON = 89;
const MUTE_1_BUTTON = 79;
const MUTE_2_BUTTON = 69;
const MUTE_3_BUTTON = 59;
const SCENE_0_BUTTON = 54;
const SCENE_1_BUTTON = 55;
const SCENE_2_BUTTON = 44;
const SCENE_3_BUTTON = 45;

const GREEN = 26;
const YELLOW = 100;
const BLUE = 77;
const ORANGE = 10;
const PURPLE = 80;
const WHITE = 40;
const RED = 7;
const GREY = 90;

const scenes = [];

for(var i = 0; i < 4; i++){
	scenes[i] = {tracks:[]};
	scenes[i].tracks[0] = { grid:bigGrid, pattern:[], midiRoot:22, color: GREEN, muted: false  };
	scenes[i].tracks[1] = { grid:bigGrid, pattern:[], midiRoot:34, color: PURPLE, muted: false };
	scenes[i].tracks[2] = { grid:bigGrid, pattern:[], midiRoot:46, color: BLUE, muted: false };
	scenes[i].tracks[3] = { grid:bigGrid, pattern:[], midiRoot:58, color: WHITE, muted: false };
}

var pressedButtons = [];
var currentStep = 0;
var currentTrack = 0;
var currentScene = 0;
var speed = 150;
var lastPressedStep = 0;

scenes.map(s => {
	s.tracks.map(t => {
		for(var i = 0; i < 16; i++){
			t.pattern.push({active:false, notes:[true,false,false,false,false,false,false,false,false,false,false,false,false]});
		}
	});
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
		pressedButtons.push(button);
		controller[button](button);
	}
	if(!pressed){
		pressedButtons = pressedButtons.filter(b => b != button);
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
	lightButton(scenes[currentScene].tracks[currentTrack].grid[step], color);
}

const toogleStep = (button) => {
	lastPressedStep = scenes[currentScene].tracks[currentTrack].grid.indexOf(button);
	var trackColor = scenes[currentScene].tracks[currentTrack].color;
	var step = scenes[currentScene].tracks[currentTrack].grid.indexOf(button);
	if(step != -1){
		scenes[currentScene].tracks[currentTrack].pattern[step].active = !scenes[currentScene].tracks[currentTrack].pattern[step].active; 
		scenes[currentScene].tracks[currentTrack].pattern[step].active ? lightStep(step,YELLOW) : lightStep(step,trackColor);
	}
	resetNotes(step);
}

const toogleNote = (button) => {
	var note = innerGrid.indexOf(button);
	scenes[currentScene].tracks[currentTrack].pattern[lastPressedStep].notes[note] = !scenes[currentScene].tracks[currentTrack].pattern[lastPressedStep].notes[note];
	scenes[currentScene].tracks[currentTrack].pattern[lastPressedStep].notes[note] ? lightButton(button,RED) : lightButton(button,GREY);
}

const resetNotes = (step) => {
	innerGrid.map(b => {
		scenes[currentScene].tracks[currentTrack].pattern[step].notes.map((n,i) => 
			n ? lightButton(innerGrid[i],RED):lightButton(innerGrid[i],GREY));
	});
}


const resetStep = (step) => {
	var trackColor = scenes[currentScene].tracks[currentTrack].color;
	scenes[currentScene].tracks[currentTrack].pattern[step].active ? lightStep(step,YELLOW) : lightStep(step,trackColor);
}

const resetGrid = () => {
	for(var i = 0; i < scenes[currentScene].tracks[currentTrack].grid.length;i++){
		resetStep(i);
	}
}

const resetMute = () => {
	var muteButtons = [MUTE_0_BUTTON,MUTE_1_BUTTON,MUTE_2_BUTTON,MUTE_3_BUTTON];
	for(var i = 0; i < muteButtons.length; i++){
		if(scenes[currentScene].tracks[i].muted){
			lightButton(muteButtons[i],0);
		}else{
			lightButton(muteButtons[i],scenes[currentScene].tracks[i].color);
		}
	}
}

const changeTrack = (button) => {
	currentTrack = (currentTrack + 1) % scenes[currentScene].tracks.length;
	resetGrid();
	resetMute();
}

const toogleMute = (button) => {
	switch(button){
		case MUTE_0_BUTTON:
			scenes[currentScene].tracks[0].muted = !scenes[currentScene].tracks[0].muted 
			break;
		case MUTE_1_BUTTON:
			scenes[currentScene].tracks[1].muted = !scenes[currentScene].tracks[1].muted 
			break;
		case MUTE_2_BUTTON:
			scenes[currentScene].tracks[2].muted = !scenes[currentScene].tracks[2].muted 
			break;
		case MUTE_3_BUTTON:
			scenes[currentScene].tracks[3].muted = !scenes[currentScene].tracks[3].muted 
			break;
		default:
			break;
	}
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

const lightScenes = () => {
	lightButton(SCENE_0_BUTTON,PURPLE);
	lightButton(SCENE_1_BUTTON,PURPLE);
	lightButton(SCENE_2_BUTTON,PURPLE);
	lightButton(SCENE_3_BUTTON,PURPLE);
}

const changeScene = (button) => {
	lightScenes(); 
	switch(button){
		case SCENE_0_BUTTON:
			currentScene = 0;
			lightButton(SCENE_0_BUTTON,YELLOW);
			break;
		case SCENE_1_BUTTON:
			currentScene = 1;
			lightButton(SCENE_1_BUTTON,YELLOW);
			break;
		case SCENE_2_BUTTON:
			currentScene = 2;
			lightButton(SCENE_2_BUTTON,YELLOW);
			break;
		case SCENE_3_BUTTON:
			currentScene = 3;
			lightButton(SCENE_3_BUTTON,YELLOW);
			break;
		default:
			break;
	}
	resetMute();
	resetGrid();
}

const tick = () => {
	setTimeout(function() {
		prevStep = currentStep != 0 ? currentStep -1 : 15;
		resetStep((prevStep) % 16);
		lightStep(currentStep % 16, ORANGE);
		scenes[currentScene].tracks.map(t => {
			if(t.pattern[currentStep % 16].active && !t.muted){
				externalOutput.sendMessage([176,t.midiRoot,1]);
			}
		});
		currentStep++;
		tick();
	}, speed);
}


var controller = [];
controller[CHANGE_TRACK_BUTTON] = changeTrack;
controller[SPEED_DOWN_BUTTON] = changeSpeed;
controller[SPEED_UP_BUTTON] = changeSpeed;
controller[MUTE_0_BUTTON] = toogleMute;
controller[MUTE_1_BUTTON] = toogleMute;
controller[MUTE_2_BUTTON] = toogleMute;
controller[MUTE_3_BUTTON] = toogleMute;
controller[SCENE_0_BUTTON] = changeScene;
controller[SCENE_1_BUTTON] = changeScene;
controller[SCENE_2_BUTTON] = changeScene;
controller[SCENE_3_BUTTON] = changeScene;
bigGrid.map(e => controller[e] = toogleStep);
innerGrid.map(e => controller[e] = toogleNote);

resetAll();
resetSpeed();
resetMute();
resetGrid();
tick();

const async = require('async');
const midi = require('midi');
const easymidi = require('easymidi');
const utils = require('./utils');

const configuration = utils.config('config.conf');

const bigGrid = [14,23,32,41,51,62,73,84,85,76,67,58,48,37,26,15];
const innerGrid = [24,33,42,52,63,74,75,66,57,47,36,25];

const CHANGE_TRACK_BUTTON = configuration.getIntOrDefault("CHANGE_TRACK_BUTTON",11);
const SPEED_UP_BUTTON = configuration.getIntOrDefault("SPEED_UP_BUTTON",104);
const SPEED_DOWN_BUTTON = configuration.getIntOrDefault("SPEED_DOWN_BUTTON",105);
const MUTE_0_BUTTON = configuration.getIntOrDefault("MUTE_0_BUTTON",89); 
const MUTE_1_BUTTON = configuration.getIntOrDefault("MUTE_1_BUTTON",79); 
const MUTE_2_BUTTON = configuration.getIntOrDefault("MUTE_2_BUTTON",69); 
const MUTE_3_BUTTON = configuration.getIntOrDefault("MUTE_3_BUTTON",59); 
const MUTE_4_BUTTON = configuration.getIntOrDefault("MUTE_4_BUTTON",49); 
const MUTE_5_BUTTON = configuration.getIntOrDefault("MUTE_5_BUTTON",39); 
const MUTE_6_BUTTON = configuration.getIntOrDefault("MUTE_6_BUTTON",29); 
const MUTE_7_BUTTON = configuration.getIntOrDefault("MUTE_7_BUTTON",19); 
const SCENE_0_BUTTON = configuration.getIntOrDefault("SCENE_0_BUTTON",54); 
const SCENE_1_BUTTON = configuration.getIntOrDefault("SCENE_1_BUTTON",55); 
const SCENE_2_BUTTON = configuration.getIntOrDefault("SCENE_2_BUTTON",44); 
const SCENE_3_BUTTON = configuration.getIntOrDefault("SCENE_3_BUTTON",45); 
const SHIFT_BUTTON = configuration.getIntOrDefault("SHIFT_BUTTON",18); 
const TEMPO_BUTTON = configuration.getIntOrDefault("TEMPO_BUTTON",88); 

const GREEN = 26;
const YELLOW = 100;
const BLUE = 77;
const ORANGE = 10;
const PURPLE = 80;
const WHITE = 40;
const RED = 7;
const GREY = 90;
const PINK = 4;
const LIGHT_ORANGE = 8;
const DARK_GREEN = 19;
const LIGHT_GREEN = 20;

const scenes = [];
var clockTick = -1;

for(var i = 0; i < 4; i++){
	scenes[i] = {tracks:[]};
	scenes[i].tracks[0] = { grid:bigGrid, pattern:[], midiRoot:64, color: GREEN, muted: false, tempoModifier: 1, channel: 0};
	scenes[i].tracks[1] = { grid:bigGrid, pattern:[], midiRoot:64, color: PURPLE, muted: false, tempoModifier: 1, channel: 1};
	scenes[i].tracks[2] = { grid:bigGrid, pattern:[], midiRoot:64, color: BLUE, muted: false, tempoModifier: 1, channel: 2};
	scenes[i].tracks[3] = { grid:bigGrid, pattern:[], midiRoot:64, color: WHITE, muted: false, tempoModifier: 1, channel: 3};
	scenes[i].tracks[4] = { grid:bigGrid, pattern:[], midiRoot:64, color: LIGHT_ORANGE, muted: false, tempoModifier: 1, channel: 4};
	scenes[i].tracks[5] = { grid:bigGrid, pattern:[], midiRoot:64, color: DARK_GREEN, muted: false, tempoModifier: 1, channel: 5};
	scenes[i].tracks[6] = { grid:bigGrid, pattern:[], midiRoot:64, color: LIGHT_GREEN, muted: false, tempoModifier: 1, channel: 6};
	scenes[i].tracks[7] = { grid:bigGrid, pattern:[], midiRoot:64, color: PINK, muted: false, tempoModifier: 1, channel: 7};
}

var scenesChain = [];
var currentSceneInChain = -1;
var chainMode = false;

var pressedButtons = [];
var currentStep = 0;
var currentTrack = 0;
var currentScene = 0;
var speed = 150;
var lastPressedStep = 0;

var resetClockTimeout;

scenes.map(s => {
	s.tracks.map(t => {
		for(var i = 0; i < 16; i++){
			t.pattern.push({active:false, notes:[true,false,false,false,false,false,false,false,false,false,false,false,false]}); // Default note is root
		}
	});
});


const output = new easymidi.Output(utils.getNormalPort(easymidi.getOutputs()));
const launchpadOutput = new midi.Output();
launchpadOutput.openPort(utils.getLaunchpadPort(easymidi.getOutputs()));
const input = new midi.Input();
input.openPort(utils.getLaunchpadPort(easymidi.getInputs()));
input.ignoreTypes(false, false, false); //WTF is this?

input.on('message', (deltaTime, message) => {
	var pressed = message[2] == 127;
	var button = message[1];
	pressedButtons.push(button);
	if(pressed && pressedButtons.length == 1 && controller[button] != undefined){
		controller[button](button);
	}
	if(pressed && pressedButtons.length > 1 && secondaryController[pressedButtons[1]] != undefined){
		secondaryController[button].map(f => f(pressedButtons));
	}
	if(!pressed){
		pressedButtons = pressedButtons.filter(b => b != button);
	}
});

const lightButton = (button,color) => {
	launchpadOutput.sendMessage([ 144, button, color ]);
}

const blinkButton = (button,duration,color) => {
	launchpadOutput.sendMessage([ 144, button, color ]);
	setTimeout(() => lightButton(button,0),duration);
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
	var prevStep = lastPressedStep;
	lastPressedStep = scenes[currentScene].tracks[currentTrack].grid.indexOf(button);
	var trackColor = scenes[currentScene].tracks[currentTrack].color;
	var step = scenes[currentScene].tracks[currentTrack].grid.indexOf(button);
	if(step != -1){
		scenes[currentScene].tracks[currentTrack].pattern[step].active = !scenes[currentScene].tracks[currentTrack].pattern[step].active; 
		scenes[currentScene].tracks[currentTrack].pattern[step].active ? lightStep(step,YELLOW) : lightStep(step,trackColor);
	}
	resetNotes(scenes[currentScene].tracks[currentTrack].pattern[prevStep].notes,scenes[currentScene].tracks[currentTrack].pattern[lastPressedStep].notes);
}

const toogleNote = (button) => {
	var note = innerGrid.indexOf(button);
	scenes[currentScene].tracks[currentTrack].pattern[lastPressedStep].notes[note] = !scenes[currentScene].tracks[currentTrack].pattern[lastPressedStep].notes[note];
	scenes[currentScene].tracks[currentTrack].pattern[lastPressedStep].notes[note] ? lightButton(button,RED) : lightButton(button,GREY);
}

const resetNotes = (prevNotes,notes) => {
	var tasks = [];
	var diff = utils.substractArray(prevNotes,notes);
	diff.map((e,i) => {
		if(e == -1) { 
			tasks.push((callback) => {
				lightButton(innerGrid[i],RED);
				callback();
			});
		}
		if(e == 1) { 
			tasks.push((callback) => {
				lightButton(innerGrid[i],GREY);
				callback();
			});
		}
	});
	async.parallel(tasks,(error,results) => {});
};


const resetStep = (step) => {
	var trackColor = scenes[currentScene].tracks[currentTrack].color;
	scenes[currentScene].tracks[currentTrack].pattern[step].active ? lightStep(step,YELLOW) : lightStep(step,trackColor);
}

const showNotes = (pressedButtons) => {
	var step = bigGrid.indexOf(pressedButtons[1]);
	if(step != -1 && pressedButtons[0] == SHIFT_BUTTON){
		resetNotes(scenes[currentScene].tracks[currentTrack].pattern[lastPressedStep].notes,scenes[currentScene].tracks[currentTrack].pattern[step].notes);
		lastPressedStep = scenes[currentScene].tracks[currentTrack].grid.indexOf(pressedButtons[1]);
	}
}

const setupNotes = () => {
	innerGrid.map((e,i) => i == 0 ? lightButton(e,RED):lightButton(e,GREY));
}

const resetGrid = () => {
	for(var i = 0; i < scenes[currentScene].tracks[currentTrack].grid.length;i++){
		resetStep(i);
	}
}

const resetMute = () => {
	var muteButtons = [MUTE_0_BUTTON,MUTE_1_BUTTON,MUTE_2_BUTTON,MUTE_3_BUTTON,MUTE_4_BUTTON,MUTE_5_BUTTON,MUTE_6_BUTTON,MUTE_7_BUTTON];
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
	resetTempo();
}

const toogleMute = (button) => {
	var muteButtons = [MUTE_0_BUTTON,MUTE_1_BUTTON,MUTE_2_BUTTON,MUTE_3_BUTTON,MUTE_4_BUTTON,MUTE_5_BUTTON,MUTE_6_BUTTON,MUTE_7_BUTTON];
	var track = muteButtons.indexOf(button);
	if(track != -1){
			scenes[currentScene].tracks[track].muted = !scenes[currentScene].tracks[track].muted;
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
	var prevScene = currentScene;
	lightScenes();
	resetSceneChain();
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
	resetNotes(scenes[prevScene].tracks[currentTrack].pattern[lastPressedStep].notes,scenes[currentScene].tracks[currentTrack].pattern[lastPressedStep].notes);
}

const copyScene = (pressedButtons) => {
	var sceneButtons = [SCENE_0_BUTTON,SCENE_1_BUTTON,SCENE_2_BUTTON,SCENE_3_BUTTON];
	var originScene = sceneButtons.indexOf(pressedButtons[0]);
	var targetScene = sceneButtons.indexOf(pressedButtons[1]);
	if(originScene != -1 && targetScene != -1){
		scenes[targetScene] = JSON.parse(JSON.stringify(scenes[originScene])); // Dirty trick for object deep copy by value
		blinkButton(SHIFT_BUTTON,200,RED);
	}
}

const changeTempo = (button) => {
	var tempos = [0.5, 1];
	var trackTempo = scenes[currentScene].tracks[currentTrack].tempoModifier;
	scenes[currentScene].tracks[currentTrack].tempoModifier = tempos[(tempos.indexOf(trackTempo) + 1) % tempos.length];
	resetTempo();
	resetGrid();
}

const resetTempo = () => {
	var tempos = [0.5, 1];
	var colors = [YELLOW,BLUE, ORANGE, PURPLE];
	var trackTempo = scenes[currentScene].tracks[currentTrack].tempoModifier;
	var tempoColor = colors[tempos.indexOf(trackTempo)];
	lightButton(TEMPO_BUTTON, tempoColor);
}

const lightNextStep = () => {
	var modCurrentStep = currentStep * scenes[currentScene].tracks[currentTrack].tempoModifier;
	prevStep = modCurrentStep != 0 ? modCurrentStep - 1 : 15;
	if(utils.isInt(modCurrentStep)){
		resetStep((prevStep) % 16);
		lightStep(modCurrentStep % 16, ORANGE);
	}
}

const playNextStep = () => {
	var tasks = [];
	var scene = getPlayingScene(clockTick);
	scenes[scene].tracks.map(t => {
		var trackCurrentStep = (currentStep * t.tempoModifier);
		var step = t.pattern[trackCurrentStep % 16];
		if(step != undefined && step.active && !t.muted){
			step.notes.map((n,i) => {
				if(n) {
					tasks.push((callback) => {
						output.send('noteon', {note: t.midiRoot + i,velocity: 127,channel: t.channel});
						callback();
					});
				}
			});
		}
	});
	async.parallel(tasks,(error,results) => {});
}

const chainScenes = (pressedButtons) => {
	var sceneButtons = [SCENE_0_BUTTON,SCENE_1_BUTTON,SCENE_2_BUTTON,SCENE_3_BUTTON];
	var scene = sceneButtons.indexOf(pressedButtons[1]);
	if(pressedButtons.length == 2 && pressedButtons[0] == SHIFT_BUTTON && scene != -1){
		chainMode = true;
		scenesChain.push(scene);
	}
}

const getPlayingScene = (clockTick) => {
	var shouldChange = clockTick % (6*16) == 0;
	var nextScene = !shouldChange ? scenesChain[currentSceneInChain % scenesChain.length] : scenesChain[currentSceneInChain++ % scenesChain.length];
	return chainMode ? nextScene : currentScene;
}

const resetSceneChain = () => {
	chainMode = false;
	currentSceneInChain = -1;
	scenesChain = [];
}

const lightNextScene = () => {
	var sceneButtons = [SCENE_0_BUTTON,SCENE_1_BUTTON,SCENE_2_BUTTON,SCENE_3_BUTTON];
	var playingScene = scenesChain[currentSceneInChain % scenesChain.length];
	var nextPlayingScene = scenesChain[(currentSceneInChain + 1) % scenesChain.length];
	var prevScene = scenesChain[(currentSceneInChain - 1) % scenesChain.length];
	lightButton(sceneButtons[prevScene],PURPLE);
	lightButton(sceneButtons[nextPlayingScene],BLUE);
	lightButton(sceneButtons[playingScene],ORANGE);
}

var clockInput = new easymidi.Input(utils.getNormalPort(easymidi.getInputs()));
clockInput.on('clock', function () {
	clockTick++;
	resetClock();
	if(clockTick % 6 == 0){
		lightNextStep();
		playNextStep();
		currentStep++;
	}
	if(clockTick % (6*16) == 0 && chainMode){
		lightNextScene();
	}
});

var resetClock = () => {
	if(resetClockTimeout != undefined){
		clearTimeout(resetClockTimeout);
	}
	resetClockTimeout = setTimeout(resetClockTick ,500);
	
}

var resetClockTick = () => {
	clockTick = -1;
	currentStep = 0;
}

var controller = [];
var secondaryController = [];

// Setup simple controller
controller[TEMPO_BUTTON] = changeTempo;
controller[CHANGE_TRACK_BUTTON] = changeTrack;
controller[SPEED_DOWN_BUTTON] = changeSpeed;
controller[SPEED_UP_BUTTON] = changeSpeed;
controller[MUTE_0_BUTTON] = toogleMute;
controller[MUTE_1_BUTTON] = toogleMute;
controller[MUTE_2_BUTTON] = toogleMute;
controller[MUTE_3_BUTTON] = toogleMute;
controller[MUTE_4_BUTTON] = toogleMute;
controller[MUTE_5_BUTTON] = toogleMute;
controller[MUTE_6_BUTTON] = toogleMute;
controller[MUTE_7_BUTTON] = toogleMute;
controller[SCENE_0_BUTTON] = changeScene;
controller[SCENE_1_BUTTON] = changeScene;
controller[SCENE_2_BUTTON] = changeScene;
controller[SCENE_3_BUTTON] = changeScene;
bigGrid.map(e => controller[e] = toogleStep);
innerGrid.map(e => controller[e] = toogleNote);

//Setup secondary controller, this controller is for multi-button presses
secondaryController[SCENE_0_BUTTON] = [copyScene,chainScenes];
secondaryController[SCENE_1_BUTTON] = [copyScene,chainScenes];
secondaryController[SCENE_2_BUTTON] = [copyScene,chainScenes];
secondaryController[SCENE_3_BUTTON] = [copyScene,chainScenes];
bigGrid.map(e => secondaryController[e] = [showNotes]);

resetAll();
resetSpeed();
resetMute();
resetGrid();
changeScene(SCENE_0_BUTTON);
setupNotes();
resetTempo();

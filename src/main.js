const easymidi = require('easymidi');
const utils = require('./utils');
const render = require('./render');
const lib = require('./lib');
const midi = require('./midi');
const cons = require('./constants');

const launchpadOutput = new easymidi.Output(utils.getLaunchpadPort(easymidi.getOutputs()))
const input = new easymidi.Input(utils.getLaunchpadPort(easymidi.getInputs()));
const output = new easymidi.Output(utils.getNormalPort(easymidi.getOutputs()));
const clockInput = new easymidi.Input(utils.getNormalPort(easymidi.getInputs()));
const scenes = [];

for(var i = 0; i < 4; i++){
	scenes[i] = {tracks:[]};
	scenes[i].tracks[0] = { pattern:[], trackLength:16, midiRoot:64, color: cons.COLOR_1, muted: false, tempoModifier: 1, channel: 0};
	scenes[i].tracks[1] = { pattern:[], trackLength:16, midiRoot:64, color: cons.COLOR_5, muted: false, tempoModifier: 1, channel: 1};
	scenes[i].tracks[2] = { pattern:[], trackLength:16, midiRoot:64, color: cons.COLOR_3, muted: false, tempoModifier: 1, channel: 2};
	scenes[i].tracks[3] = { pattern:[], trackLength:16, midiRoot:64, color: cons.COLOR_6, muted: false, tempoModifier: 1, channel: 3};
	scenes[i].tracks[4] = { pattern:[], trackLength:16, midiRoot:64, color: cons.COLOR_10, muted: false, tempoModifier: 1, channel: 4};
	scenes[i].tracks[5] = { pattern:[], trackLength:16, midiRoot:64, color: cons.COLOR_11, muted: false, tempoModifier: 1, channel: 5};
	scenes[i].tracks[6] = { pattern:[], trackLength:16, midiRoot:64, color: cons.COLOR_12, muted: false, tempoModifier: 1, channel: 6};
	scenes[i].tracks[7] = { pattern:[], trackLength:16, midiRoot:64, color: cons.COLOR_9, muted: false, tempoModifier: 1, channel: 7};
}

scenes.map(s => {
	s.tracks.map(t => {
		for(var i = 0; i < 16; i++){
			t.pattern.push({active:false, notes:[1,0,0,0,0,0,0,0,0,0,0,0,0]}); // Default note is root

		}
	})
});

var state =  {
	pressedButtons:[],
	currentStep:0,
	currentTrack:0,
	currentScene:0,
	lastPressedStep:0,
	scenesChain:[],
	currentSceneInChain:-1,
	chainMode:false,
	clockTick : -1,
	clockResolution : 6, //Number of ticks per step
	resetClockTimeout : undefined,
	midiNotesQueue:[],
};

clockInput.on('clock', function () {
	state.clockTick++;
	midi.resetClock(state);
	if(state.clockTick % 6 == 0){
		midi.playNextStep(state,scenes,output);
		render.lightCurrentStep(launchpadOutput,state,scenes);
		state.currentStep++;
	}
});

input.on('noteon', (message) => {
	var pressed = message.velocity == 127;
	var button = message.note;
	state.pressedButtons.push(button);
	if(pressed && state.pressedButtons.length == 1 && controller[button] != undefined){
		controller[button](button,state,scenes);
	}
	if(pressed && state.pressedButtons.length > 1 && secondaryController[state.pressedButtons[1]] != undefined){
		secondaryController[button].map(f => f(state,scenes));
	}
	if(!pressed){
		state.pressedButtons = state.pressedButtons.filter(b => b != button);
	}else{
		render.render(launchpadOutput,scenes,state);
	}
});

// Setup simple controller
var controller = [];
controller[cons.TEMPO_BUTTON] = lib.changeTempo;
cons.BIG_GRID.map(e => controller[e] = lib.toogleStep);
cons.INNER_GRID.map(e => controller[e] = lib.toogleNote);
cons.MUTE_BUTTONS.map(e => controller[e] = lib.toogleMute);
cons.SCENE_BUTTONS.map(e => controller[e] = lib.changeScene);

//Setup secondary controller, this controller is for multi-button presses
var secondaryController = [];
cons.SCENE_BUTTONS.map(e => secondaryController[e] = [lib.copyScene,lib.chainScenes]);
cons.BIG_GRID.map(e => secondaryController[e] = [lib.showNotes,lib.changeTrackLength]);
cons.MUTE_BUTTONS.map(e => secondaryController[e] = [lib.changeTrack]);

//Initial render
render.render(launchpadOutput,scenes,state);

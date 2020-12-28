const easymidi = require('easymidi');
const utils = require('./utils');
const render = require('./render');
const lib = require('./lib');
const midi = require('./midi');
const cons = require('./constants');
const chords = require('./chords');

const output = new easymidi.Output(utils.getNormalPort("Select midi output: ", easymidi.getOutputs()));
const clockInput = new easymidi.Input(utils.getNormalPort("Select midi clock input: ", easymidi.getInputs()));
const launchpadOutput = new easymidi.Output(utils.getLaunchpadPort(easymidi.getOutputs()))
const input = new easymidi.Input(utils.getLaunchpadPort(easymidi.getInputs()));

console.log('\n Seq is ready! \n');

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
	scenesStack: [],
	chords: [],
	mode : 'seq',
	renderReset : false,
};

state.chords = chords.createChords();

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
	update(pressed, button);
});

input.on('cc', (message) => {
	var pressed = message.value == 127;
	var button = message.controller;
	update(pressed, button);
});

const update = (pressed, button) => {
	switch(state.mode){
	case 'seq':
		updateSeqMode(pressed, button);
		break;
	case 'chords':
		updateChordMode(pressed, button);
		break;
	default:
		break;
	}
}

const updateSeqMode = (pressed, button) => {
	state.pressedButtons.push(button);
	if(pressed && controller[state.mode][button] != undefined){
		lib.addScenesToStack(button, state, scenes);
		controller[state.mode][button].map(f => f(state,scenes));
	}
	if(!pressed){
		state.pressedButtons = state.pressedButtons.filter(b => b != button);
	}else{
		render.render(launchpadOutput,scenes,state);
	}
};

const updateChordMode = (pressed, button) => {
	if(pressed){
		if(state.chords[button] != undefined){
			state.chords[button].map(n => output.send('noteon', {note:n, velocity:127, channel:1}));
		}
		if(controller[state.mode][button] != undefined){
			controller[state.mode][button].map(f => f(state,scenes));
		}
	}else{
		if(state.chords[button] != undefined){
			state.chords[button].map(n => output.send('noteoff', {note:n, velocity:127, channel:1}));
		}
	}
	render.render(launchpadOutput,scenes,state);
};

// Setup simple controller
var controller = [];
controller['seq'] = [];
controller['chords'] = [];
controller['seq'][cons.TEMPO_BUTTON] = [lib.changeTempo];
cons.INNER_GRID.map(e => controller['seq'][e] = [lib.toogleNote]);
cons.SCENE_BUTTONS.map(e => controller['seq'][e] = [lib.changeScene,lib.copyScene,lib.chainScenes]);
cons.BIG_GRID.map(e => controller['seq'][e] = [lib.toogleStep,lib.showNotes,lib.changeTrackLength]);
cons.MUTE_BUTTONS.map(e => controller['seq'][e] = [lib.toogleMute,lib.changeTrack]);
controller['seq'][cons.SHIFT_BUTTON] = [lib.undo];
controller['seq'][cons.SHIFT_2_BUTTON] = [lib.undo];
controller['seq'][cons.RIGHT_ARROW_BUTTON] = [lib.shiftPatternRight, lib.randomPattern];
controller['seq'][cons.LEFT_ARROW_BUTTON] = [lib.shiftPatternLeft, lib.randomPattern];
controller['seq'][cons.MODE_BUTTON] = [lib.toogleMode]
controller['chords'][cons.MODE_BUTTON] = [lib.toogleMode]

//Initial render
render.render(launchpadOutput,scenes,state);

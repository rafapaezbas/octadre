const easymidi = require('easymidi');
const utils = require('./utils');
const render = require('./render');
const lib = require('./lib');
const midi = require('./midi');
const cons = require('./constants');
const chords = require('./chords');
var randomGen = require('random-seed');

const output = new easymidi.Output(utils.getNormalPort("Select midi output: ", easymidi.getOutputs()));
const clockInput = new easymidi.Input(utils.getNormalPort("Select midi clock input: ", easymidi.getInputs()));
const launchpadOutput = new easymidi.Output(utils.getLaunchpadPort(easymidi.getOutputs()))
const input = new easymidi.Input(utils.getLaunchpadPort(easymidi.getInputs()));


var controller = [];
var scenes = [];
var state =  {
	pressedButtons:[],
	currentStep:0,
	currentTrack:0,
	currentScene:0,
	lastPressedStep:0,
	lastChordPressed: 0,
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
	renderReset : true,
};


clockInput.on('clock', function () {
	state.clockTick++;
	midi.resetClock(state);
	if(state.clockTick % 6 == 0){
		midi.playNextStep(state,scenes,output);
		state.currentStep++;
		if(state.mode == 'seq') {
			render.lightCurrentStep(launchpadOutput,state,scenes);
		}
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
};

const updateSeqMode = (pressed, button) => {
	if(pressed){
		state.pressedButtons.push(button);
		if(controller['seq'][button] != undefined){
			lib.addScenesToStack(button, state, scenes);
			controller['seq'][button].map(f => f(state,scenes));
			render.render(launchpadOutput,scenes,state);
		}
	}else{
		state.pressedButtons = state.pressedButtons.filter(b => b != button);
	}
};

const updateChordMode = (pressed, button) => {
	if(pressed){
		pressedChord(button);
		render.render(launchpadOutput,scenes,state);
	}else{
		unpressedChord(button);
	}
};

const pressedChord = (button) => {
	state.pressedButtons.push(button);
	var chord = state.chords[button];
	if(chord != undefined){
		state.lastChordPressed = button;
		var finalChord =chord.inversion.filter((e,i) => chords.filterByMode(i,chord.mode));
		finalChord.map(n => output.send('noteon', {note:n, velocity:127, channel:state.currentTrack}));
	}
	if(controller['chords'][button] != undefined){
		controller['chords'][button].map(f => f(state,scenes));
	}
};

const unpressedChord = (button) => {
	var chord = state.chords[button];
	if(state.chords[button] != undefined){
		chord.inversion.map(n => output.send('noteoff', {note:n, velocity:127, channel:state.currentTrack}));
	}
	state.pressedButtons = state.pressedButtons.filter(b => b != button);
};

const setupState = () => {
	state.chords = chords.createChords();
};

const setupScenes = () => {
	scenes = utils.createArray(4,{}).map(s => setupSceneTracks());
	return scenes;
};

const setupSceneTracks = () => {
	var trackColors = [cons.COLOR_1,cons.COLOR_5,cons.COLOR_3,cons.COLOR_6,cons.COLOR_10,cons.COLOR_11,cons.COLOR_12,cons.COLOR_9];
	var tracks =  utils.createArray(8,{}).map((t,i) => {
		const pattern = utils.createArray(16,{}).map(p => ({active:false, notes:[1,0,0,0,0,0,0,0,0,0,0,0,0], chords:[], length : 1}));
		return {pattern:pattern, trackLength:16, midiRoot:64, color: trackColors[i], muted: false, tempoModifier: 1, channel: i};
	});
	return {tracks: tracks};
};

const setupController = () => {
	controller['seq'] = [];
	controller['chords'] = [];
	controller['seq'][cons.TEMPO_BUTTON] = [lib.changeTempo];
	controller['seq'][cons.SHIFT_BUTTON] = [lib.undo];
	controller['seq'][cons.SHIFT_2_BUTTON] = [lib.undo];
	controller['seq'][cons.RIGHT_ARROW_BUTTON] = [lib.shiftPatternRight, lib.randomPattern];
	controller['seq'][cons.LEFT_ARROW_BUTTON] = [lib.shiftPatternLeft, lib.randomPattern];
	controller['seq'][cons.MODE_BUTTON] = [lib.toogleMode];
	cons.INNER_GRID.map(e => controller['seq'][e] = [lib.toogleNote]);
	cons.LENGTH_GRID.map(e => controller['seq'][e] = [lib.changeLength]);
	cons.SCENE_BUTTONS.map(e => controller['seq'][e] = [lib.changeScene,lib.copyScene,lib.chainScenes]);
	cons.BIG_GRID.map(e => controller['seq'][e] = [lib.toogleStep,lib.showNotes,lib.changeTrackLength]);
	cons.MUTE_BUTTONS.map(e => controller['seq'][e] = [lib.toogleMute,lib.changeTrack]);
	controller['chords'][cons.MODE_BUTTON] = [lib.toogleMode]
	cons.GRID.map(e => controller['chords'][e] = [lib.toogleChords]);
	controller['chords'][cons.CHANGE_CHORD_MODE_BUTTON] = [lib.changeChordMode];
};

setupState();
setupScenes();
setupController();
render.render(launchpadOutput,scenes,state);

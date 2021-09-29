const utils = require('./utils');
const render = require('./render');
const midi = require('./midi');
const io = require('./midi-io');
const cons = require('./constants');
const chords = require('./chords');
const controller = require('./controller');
const fs = require('fs');
const network = require('./network');
const networkController = require('./network-controller');

var scenes = [];
var state =  {
	pressedButtons:[],
	currentStep:0,
	currentTrack:0,
	currentScene:0,
	currentOctave: 5,
	lastPressedStep:0,
	lastChordPressed: undefined,
	scenesChain:[],
	currentSceneInChain:-1,
	chainMode:false,
	clockTick : -1,
	clockResolution : 6, //Number of ticks per step
	resetClockTimeout : undefined,
	midiNotesQueue:[],
	chords: undefined,
	mode : 'seq',
	renderReset : true,
	showCursor : true,
	smallGridMode : 'length',
	workspace : 2, // 0 : big_grid, 1 : brig_grid + notes, 2: big_grid + notes + small_grid
	page: 0,
};

exports.setupClockInput = (port) => {
	if(port != undefined){
		io.setClockInput(port);
	}
	io.getClockInput().on('clock', () => {
		process.nextTick(() => { //better performance?
			state.clockTick++;
			midi.resetClock(state);
			playSequencer();
		});
	});
};

exports.setupState = () => {
	state.chords = chords.createChords();
};

exports.setupScenes = () => {
	scenes = utils.createArray(4,{}).map(s => setupSceneTracks());
	return scenes;
};

exports.render = () => {
	render.render(scenes, state);
};

exports.save = (path) => {
	const bufferedState = {chords : state.chords} //Add only needed fields, IMPORTANT cannot stringify resetClockTimeout
	fs.writeFile(path, JSON.stringify({scenes: scenes,state: bufferedState}), (err) => {
		if(err){
			console.log(err);
		}
	});
};

exports.load = (path) => {
	var file = fs.readFileSync(path, 'utf8');
	scenes = JSON.parse(file).scenes;
	state.chords = JSON.parse(file).state.chords;
	render.render(scenes,state);
};


exports.setupLaunchpadInput = () => {
	io.getInput().on('noteon', (message) => {
		var pressed = message.velocity > 0;
		var button = message.note;
		update(pressed, button);
		if(network.getNetwork().connected && pressed){ //Doesnt make sense to send unpress events
			network.send(state);
		}
	});

	io.getInput().on('cc', (message) => {
		var pressed = message.value > 0;
		var button = message.controller;
		update(pressed, button);
	});
};

exports.setupIO = () => {
	state.ioError = io.setupIO();
	return state.ioError;
};

exports.getIOError = () => {
	return state.ioError;
}

exports.setupNetworkController = () => {
	network.setEventCallback((remoteState) => {
			switch(remoteState.mode){
			case 'seq':
				if(remoteState.pressedButtons.length > 0) {
					controller['seq'][remoteState.pressedButtons[remoteState.pressedButtons.length - 1]].map(f => f(remoteState,scenes));
				}
				break;
			case 'chords':
				// TODO
				break;
			default:
				break;
			}
			render.render(scenes,state);
	});
}

const update = (pressed, button) => {
	switch(state.mode){
	case 'seq':
		updateSeqMode(pressed, button);
		playNote(pressed,button);
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
			controller['seq'][button].map(f => f(state,scenes));
			render.render(scenes,state);
		}
	}else{
		state.pressedButtons = state.pressedButtons.filter(b => b != button);
	}
};

const updateChordMode = (pressed, button) => {
	if(pressed){
		pressedChord(button);
		render.render(scenes,state);
	}else{
		unpressedChord(button);
	}
};

const pressedChord = (button) => {
	state.pressedButtons.push(button);
	const scale = scenes[state.currentScene].tracks[state.currentTrack].pattern[state.lastPressedStep].chordScale
	var chord = state.chords[scale][button];
	if(chord != undefined){
		state.lastChordPressed = button;
		var finalChord = chord.inversion.filter((e,i) => chords.filterByMode(i,chord.mode));
		var octaveModifier = scenes[state.currentScene].tracks[state.currentTrack].midiRoot - 60;
		finalChord.map(n => io.getOutput().send('noteon', {note:n + octaveModifier, velocity:127, channel:state.currentTrack}));
	}
	if(controller['chords'][button] != undefined){
		controller['chords'][button].map(f => f(state,scenes));
	}
};

const unpressedChord = (button) => {
	const scale = scenes[state.currentScene].tracks[state.currentTrack].pattern[state.lastPressedStep].chordScale
	var chord = state.chords[scale][button];
	var octaveModifier = scenes[state.currentScene].tracks[state.currentTrack].midiRoot - 60;
	if(chord != undefined){
		chord.inversion.map(n => io.getOutput().send('noteoff', {note:n + octaveModifier, velocity:127, channel:state.currentTrack}));
	}
	state.pressedButtons = state.pressedButtons.filter(b => b != button);
};

const setupSceneTracks = () => {

	const notes = utils.createArray(96, false)
	notes[60] = true // default note

	var trackColors = [cons.COLOR_TRACK_1,cons.COLOR_TRACK_2,cons.COLOR_TRACK_3,cons.COLOR_TRACK_4,cons.COLOR_TRACK_5,cons.COLOR_TRACK_6,cons.COLOR_TRACK_7,cons.COLOR_TRACK_8,cons.COLOR_TRACK_9,cons.COLOR_TRACK_10,cons.COLOR_TRACK_11,cons.COLOR_TRACK_12,cons.COLOR_TRACK_13,cons.COLOR_TRACK_14,cons.COLOR_TRACK_15,cons.COLOR_TRACK_16];
	var tracks =  utils.createArray(16,{}).map((t,i) => {
		const pattern = utils.createArray(16,{}).map(p => ({active:false, notes: notes, chords:[], chordPlayMode: 0, chordScale: 0, length : 1, velocity: 100, triplet: false, doubleNote: false, singleTriplet : false, octave: 0}));
		return {pattern:pattern, trackLength:16, midiRoot:60, color: trackColors[i], muted: false, tempoModifier: 1, channel: i};
	});
	return {tracks: tracks};
};

const playNote = (pressed, button) => {
	if(state.pressedButtons[0] != cons.SHIFT_BUTTON && cons.INNER_GRID.indexOf(button) != -1){
		var midiMessage = pressed ? 'noteon' : 'noteoff';
		io.getOutput().send(midiMessage, {note: state.currentOctave * 12 + cons.INNER_GRID.indexOf(button) ,velocity: 127,channel: state.currentTrack});
	}
};

const playSequencer = () => {
	if(state.clockTick % 6 == 0){
		midi.nextStep(state,scenes);
		state.currentStep++;
		if(state.mode == 'seq' && state.showCursor) {
			render.lightCurrentStep(state,scenes);
		}
	}
	midi.sendMidi(state);
};

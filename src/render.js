const utils = require('./utils');
const cons = require('./constants');
const io = require('./midi-io');

const header = [ 240, 00, 32, 41, 2, 24, 10 ];
const setAllHeader = [ 240, 00, 32, 41, 2, 24, 14 ];
const flashHeader = [ 240, 00, 32, 41, 2, 24, 40 , 0 ];
const byColumnHeader = [ 240, 00, 32, 41, 2, 24, 12 ];

exports.render = (scenes,state) => {

	if(state.renderReset){
		renderReset();
		state.renderReset = false;
	}

	switch(state.mode){
	case 'seq':
		renderSeq(scenes,state);
		break;
	case 'chords':
		renderChords(scenes,state);
		break;
	default:
		break;
	}
};

// TODO improve this, please.
exports.lightCurrentStep = (state,scenes) => {
	var trackLength = scenes[state.currentScene].tracks[state.currentTrack].trackLength;
	var modCurrentStep = state.currentStep * scenes[state.currentScene].tracks[state.currentTrack].tempoModifier;
	var prevStep = modCurrentStep != 0 ? modCurrentStep - 1 : trackLength - 1;
	if(utils.isInt(modCurrentStep)){
		var sysex = [];
		var message = sysex.concat(header).concat(resetStepMessage((prevStep) % trackLength,state, scenes))
			.concat([cons.BIG_GRID[modCurrentStep % trackLength],cons.COLOR_CURSOR]).concat([247]);
		io.launchpadOutput.send('sysex',message);
	}
	if(prevStep % trackLength == state.lastPressedStep){
		var flashLastPressedStepMessage = flashLastPressedStep(scenes,state);
		io.launchpadOutput.send('sysex',flashLastPressedStepMessage);
	}
}

const renderSeq = (scenes,state) => {
	var sysex = []
	var stepsMessage = generateStepsMessage(scenes,state);
	var mutesMessage = generateMutesMessage(scenes,state);
	var notesMessage = generateNotesMessage(scenes,state);
	var scenesMessage = generateScenesMessage(scenes,state);
	var lengthMessage = generateLengthMessage(scenes,state);
	var flashLastPressedStepMessage = flashLastPressedStep(scenes,state);
	var message = sysex.concat(header).concat(stepsMessage).concat(mutesMessage).concat(scenesMessage).concat(lengthMessage).concat(notesMessage).concat([247]);
	io.launchpadOutput.send('sysex',message);
	io.launchpadOutput.send('sysex',flashLastPressedStepMessage);
	return message;
}

const renderChords = (scenes,state) => {
	var sysex = []
	var chordsByColumnMessage = sysex.concat(byColumnHeader).concat(generateColumnChordsMessage()).concat([247]);
	var chordsMessage = sysex.concat(header).concat(generateChordsMessage(scenes, state)).concat([247]);
	io.launchpadOutput.send('sysex',chordsByColumnMessage);
	io.launchpadOutput.send('sysex',chordsMessage);
};

const generateStepsMessage = (scenes,state) => {
	return scenes[state.currentScene].tracks[state.currentTrack].pattern.reduce((acc,e,i) => {
		acc.push(cons.BIG_GRID[i]);
		if(i < scenes[state.currentScene].tracks[state.currentTrack].trackLength){
			e.active ? acc.push(cons.COLOR_ACTIVE_STEP) : acc.push(scenes[state.currentScene].tracks[state.currentTrack].color);
		} else {
			acc.push(0);
		}
		return acc;
	},[]);
};

const generateNotesMessage = (scenes,state) => {
	return scenes[state.currentScene].tracks[state.currentTrack].pattern[state.lastPressedStep].notes.reduce((acc,e,i) => {
		acc.push(cons.INNER_GRID[i]);
		e ? acc.push(cons.COLOR_ACTIVE_NOTE) : acc.push(cons.COLOR_NON_ACTIVE_NOTE);
		return acc;
	},[]);
};

const generateChordsMessage = (scenes,state) => {
	return scenes[state.currentScene].tracks[state.currentTrack].pattern[state.lastPressedStep].chords.reduce((acc,e,i) => {
		acc.push(e);
		acc.push(cons.COLOR_ACTIVE_CHORD);
		return acc;
	},[]);
};

const generateColumnChordsMessage = () => {
	const chordColors = [cons.COLOR_TONIC,cons.COLOR_SUBDOMINANT,cons.COLOR_TONIC,cons.COLOR_SUBDOMINANT,cons.COLOR_DOMINANT,cons.COLOR_TONIC,cons.COLOR_DOMINANT];
	return chordColors.reduce((acc,e,i) => {
		acc.push(i);
		acc.push(e);
		return acc;
	},[]);
};

const generateMutesMessage = (scenes,state) => {
	return scenes[state.currentScene].tracks.reduce((acc,e,i) => {
		acc.push(cons.MUTE_BUTTONS[i]);
		e.muted ? acc.push(0) : acc.push(e.color);
		return acc;
	},[]);
};

const generateScenesMessage = (scenes,state) => {
	var color = scenes[state.currentScene].tracks[state.currentTrack].color;
	return cons.SCENE_BUTTONS.reduce((acc,e, i) => {
		acc.push(e);
		i == state.currentScene ? acc.push(cons.COLOR_ACTIVE_SCENE) : acc.push(color);
		return acc;
	},[]);
};

const generateLengthMessage = (scenes,state) => {
	var length =  scenes[state.currentScene].tracks[state.currentTrack].pattern[state.lastPressedStep].length;
	return cons.LENGTH_GRID.reduce((acc,e, i) => {
		acc.push(e);
		i  < length/2  ? acc.push(cons.COLOR_LENGTH) : acc.push(0);
		return acc;
	},[]);
};

const flashLastPressedStep = (scenes, state) => {
	var sysex = [];
	var stepButton = cons.BIG_GRID[state.lastPressedStep];
	var currentTrack = scenes[state.currentScene].tracks[state.currentTrack];
	var color = currentTrack.pattern[state.lastPressedStep].active ? cons.COLOR_ACTIVE_STEP : currentTrack.color;
	return sysex.concat(flashHeader).concat([stepButton, color]).concat([247]);
};

const resetStepMessage = (step,state,scenes) => {
	var trackColor = scenes[state.currentScene].tracks[state.currentTrack].color;
	var color = scenes[state.currentScene].tracks[state.currentTrack].pattern[step].active ? cons.COLOR_ACTIVE_STEP : trackColor;
	return [cons.BIG_GRID[step], color];
};

const renderReset = () => {
	var sysex = []
	var color = 0; // Note-off
	var message = sysex.concat(setAllHeader).concat(color).concat([247]);
	io.launchpadOutput.send('sysex',message);
	return message;
};

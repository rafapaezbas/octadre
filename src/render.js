const utils = require('./utils');
const cons = require('./constants');
const io = require('./midi-io');

const header = [ 240, 0, 32, 41, 2, 24, 10 ];
const setAllHeader = [ 240, 0, 32, 41, 2, 24, 14 ];
const flashHeader = [ 240, 0, 32, 41, 2, 24, 40 , 0 ];
const byColumnHeader = [ 240, 0, 32, 41, 2, 24, 12 ];

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
		io.getLaunchpadOutput().send('sysex',message);
	}
	if(prevStep % trackLength == state.lastPressedStep){
		var flashLastPressedStepMessage = flashLastPressedStep(scenes,state);
		io.getLaunchpadOutput().send('sysex',flashLastPressedStepMessage);
	}
};

const renderSeq = (scenes,state) => {
	var sysex = [];
	var mutesMessage = generateMutesMessage(scenes,state);
	var stepsMessage = generateStepsMessage(scenes,state);
	var notesMessage = state.workspace > 0 ? generateNotesMessage(scenes,state) : [];
	var smallGridMessage = state.workspace > 1 ? generateSmallGridMessage(scenes,state) : [];
	var scenesMessage = generateScenesMessage(scenes,state);
	var tripletsMessage = generateTripletsMessage(scenes,state);
	var doubleNotesMessage = generateDoubleNotesMessage(scenes,state);
	var flashLastPressedStepMessage = flashLastPressedStep(scenes,state);
	var message = sysex.concat(header).concat(stepsMessage).concat(tripletsMessage).concat(doubleNotesMessage).concat(mutesMessage).concat(scenesMessage)
		.concat(smallGridMessage).concat(notesMessage).concat([247]);
	io.getLaunchpadOutput().send('sysex',message);
	io.getLaunchpadOutput().send('sysex',flashLastPressedStepMessage);
	return message;
};

const renderChords = (scenes,state) => {
	var sysex = [];
	var chordsGridMessage = sysex.concat(header).concat(generateChordsGridMessage()).concat([247]);
	var chordsMessage = sysex.concat(header).concat(generateChordsMessage(scenes, state)).concat([247]);
	var chordsPlayModeMessage = sysex.concat(header).concat(generateChordsPlayModeMessage(scenes, state)).concat([247]);
	io.getLaunchpadOutput().send('sysex',chordsGridMessage);
	io.getLaunchpadOutput().send('sysex',chordsMessage);
	io.getLaunchpadOutput().send('sysex',chordsPlayModeMessage);
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

const generateTripletsMessage = (scenes,state) => {
	return scenes[state.currentScene].tracks[state.currentTrack].pattern.reduce((acc,e,i) => {
		if((e.triplet || e.singleTriplet) && i < scenes[state.currentScene].tracks[state.currentTrack].trackLength){
			acc.push(cons.BIG_GRID[i]);
			acc.push(cons.COLOR_TRIPLET);
		}
		return acc;
	},[]);
};

const generateDoubleNotesMessage = (scenes,state) => {
	return scenes[state.currentScene].tracks[state.currentTrack].pattern.reduce((acc,e,i) => {
		if(e.doubleNote){
			acc.push(cons.BIG_GRID[i]);
			acc.push(cons.COLOR_DOUBLE_NOTE);
		}
		return acc;
	},[]);
};

const generateNotesMessage = (scenes,state) => {
	return scenes[state.currentScene].tracks[state.currentTrack].pattern[state.lastPressedStep].notes.slice(state.currentOctave * 12, (state.currentOctave * 12) + 12).reduce((acc,e,i) => {
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

const generateChordsPlayModeMessage = (scenes,state) => {
	const currentStepChordPlayMode = scenes[state.currentScene].tracks[state.currentTrack].pattern[state.lastPressedStep].chordPlayMode;
	return cons.CHORD_PLAY_MODE_BUTTONS.reduce((acc,e,i) => {
		acc.push(e);
		acc.push(currentStepChordPlayMode == i ? cons.COLOR_ACTIVE_NOTE : 0);
		return acc;
	},[]);
};

const generateChordsGridMessage = () => {
	const chordColors = [cons.COLOR_TONIC,cons.COLOR_SUBDOMINANT,cons.COLOR_TONIC,cons.COLOR_SUBDOMINANT,cons.COLOR_DOMINANT,cons.COLOR_TONIC,cons.COLOR_DOMINANT];
	var message = [];
	for(var i = 1; i < 8; i++){
		for(var j = 1; j < 8; j++){
			message.push((10 * j) + i);
			message.push(chordColors[i - 1]);
		}
	}
	return message;
}

const generateMutesMessage = (scenes,state) => {
	const tracks = scenes[state.currentScene].tracks.slice(state.page * 8,(state.page * 8) + 8);
	return tracks.reduce((acc,e,i) => {
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

const generateSmallGridMessage = (scenes,state) => {
	if(state.smallGridMode == 'length'){
		return  generateLengthMessage(scenes,state)
	}
	else if(state.smallGridMode == 'velocity'){
		return generateVelocityMessage(scenes,state);
	}
	else{
		return generateOctaveMessage(scenes,state);
	}
};

const generateLengthMessage = (scenes,state) => {
	var length =  scenes[state.currentScene].tracks[state.currentTrack].pattern[state.lastPressedStep].length;
	return cons.SMALL_GRID.reduce((acc,e, i) => {
		acc.push(e);
		i  < length/2  ? acc.push(cons.COLOR_LENGTH) : acc.push(0);
		return acc;
	},[]);
};

const generateVelocityMessage = (scenes, state) => {
	var velocity = scenes[state.currentScene].tracks[state.currentTrack].pattern[state.lastPressedStep].velocity;
	var mappedVelocityValue = (velocity * cons.SMALL_GRID.length) / 127;
	return cons.SMALL_GRID.reduce((acc,e, i) => {
		acc.push(e);
		i  < mappedVelocityValue  ? acc.push(cons.COLOR_VELOCITY) : acc.push(0);
		return acc;
	},[]);
};

const generateOctaveMessage = (scenes, state) => {
	return cons.SMALL_GRID.reduce((acc,e, i) => {
		acc.push(e);
		i  == state.currentOctave ? acc.push(cons.COLOR_OCTAVE) : acc.push(0);
		return acc;
	},[]);
};

const flashLastPressedStep = (scenes, state) => {
	var sysex = [];
	var stepButton = cons.BIG_GRID[state.lastPressedStep];
	var currentTrack = scenes[state.currentScene].tracks[state.currentTrack];
	var color = undefined;
	if(currentTrack.pattern[state.lastPressedStep].triplet  || currentTrack.pattern[state.lastPressedStep].singleTriplet){
		color = cons.COLOR_TRIPLET;
	}
	else if(currentTrack.pattern[state.lastPressedStep].doubleNote){
		color = cons.COLOR_DOUBLE_NOTE;
	}else{
		color = currentTrack.pattern[state.lastPressedStep].active ? cons.COLOR_ACTIVE_STEP : currentTrack.color;
	}
	return sysex.concat(flashHeader).concat([stepButton, color]).concat([247]);
};

const resetStepMessage = (step,state,scenes) => {
	var trackColor = scenes[state.currentScene].tracks[state.currentTrack].color;
	var isActive = scenes[state.currentScene].tracks[state.currentTrack].pattern[step].active;
	var isTriplet =  scenes[state.currentScene].tracks[state.currentTrack].pattern[step].triplet || scenes[state.currentScene].tracks[state.currentTrack].pattern[step].singleTriplet;
	var isDoubleNote =  scenes[state.currentScene].tracks[state.currentTrack].pattern[step].doubleNote;
	var color = isTriplet ?  cons.COLOR_TRIPLET : isDoubleNote ? cons.COLOR_DOUBLE_NOTE : isActive ? cons.COLOR_ACTIVE_STEP : trackColor;
	return [cons.BIG_GRID[step], color];
};

const renderReset = () => {
	var sysex = [];
	var color = 0; // Note-off
	var message = sysex.concat(setAllHeader).concat(color).concat([247]);
	io.getLaunchpadOutput().send('sysex',message);
	return message;
};

const renderBigGrid = () => {
	var sysex = [];
	var grid = cons.BIG_GRID.reduce((acc,e, i) => {
		acc.push(e);
		acc.push(cons.COLOR_NON_ACTIVE_NOTE);
		return acc;
	},[]);
	var message = sysex.concat(header).concat(grid).concat([247]);
	io.getLaunchpadOutput().send('sysex',message);
}

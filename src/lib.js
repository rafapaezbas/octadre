const cons = require('./constants');
const utils = require('./utils');
const chords = require('./chords');
const io = require('./midi-io');

exports.toogleStep = (state,scenes) => {
	var currentTrack = scenes[state.currentScene].tracks[state.currentTrack];
	var step = cons.BIG_GRID.indexOf(state.pressedButtons[0]);
	if(state.pressedButtons.length == 1 && isBigGrid(state.pressedButtons[0]) && currentTrack.trackLength > step && !stepIsInTriplet(step,currentTrack)){
		state.lastPressedStep = step;
		currentTrack.pattern[step].active ^= true;
		scenes[state.currentScene].tracks[state.currentTrack].pattern[step].doubleNote = false;
		scenes[state.currentScene].tracks[state.currentTrack].pattern[step].singleTriplet = false;
	}
};

exports.toogleTriplet = (state,scenes) => {
	var currentTrack = scenes[state.currentScene].tracks[state.currentTrack];
	var firstStep = cons.BIG_GRID.indexOf(state.pressedButtons[0]);
	var secondStep = cons.BIG_GRID.indexOf(state.pressedButtons[1]);
	if(state.pressedButtons.length == 2
	   && firstStep != -1
	   && secondStep != -1
	   && currentTrack.trackLength > secondStep
	   && buttonsAreContinousInGrid(state.pressedButtons)
	   && stepsInSameTripletState(state.pressedButtons, currentTrack)
	   && stepsCanToogleTriplet(firstStep, secondStep, currentTrack)){
		state.lastPressedStep = firstStep;
		currentTrack.pattern[firstStep].triplet ^= true;
		currentTrack.pattern[firstStep].active = currentTrack.pattern[firstStep].triplet;
		currentTrack.pattern[(firstStep + 1) % cons.BIG_GRID.length].triplet ^= true;
		currentTrack.pattern[(firstStep + 1) % cons.BIG_GRID.length].active = false;
	}
};

exports.toogleDoubleNote = (state,scenes) => {
	const step = cons.BIG_GRID.indexOf(state.pressedButtons[2]);
	const isTriplet = step == -1 ? false : scenes[state.currentScene].tracks[state.currentTrack].pattern[step].triplet;
	const isActive = step == -1 ? false : scenes[state.currentScene].tracks[state.currentTrack].pattern[step].active;
	if(state.pressedButtons.length == 3 && state.pressedButtons[0] == cons.SHIFT_BUTTON && state.pressedButtons[1] == cons.TEMPO_BUTTON &&  step != -1 && isActive && !isTriplet){
		scenes[state.currentScene].tracks[state.currentTrack].pattern[step].doubleNote = true;
	}
};

exports.toogleSingleTriplet = (state,scenes) => {
	const step = cons.BIG_GRID.indexOf(state.pressedButtons[2]);
	const isTriplet = step == -1 ? false : scenes[state.currentScene].tracks[state.currentTrack].pattern[step].triplet;
	const isActive = step == -1 ? false : scenes[state.currentScene].tracks[state.currentTrack].pattern[step].active;
	if(state.pressedButtons.length == 3 && state.pressedButtons[0] == cons.SHIFT_2_BUTTON && state.pressedButtons[1] == cons.TEMPO_BUTTON &&  step != -1 && isActive && !isTriplet){
		scenes[state.currentScene].tracks[state.currentTrack].pattern[step].singleTriplet = true;
	}
};

exports.toogleNote = (state,scenes) => {
	if( state.pressedButtons[0] == cons.SHIFT_BUTTON && cons.INNER_GRID.indexOf(state.pressedButtons[1]) != -1 && state.workspace > 0){
		var note = cons.INNER_GRID.indexOf(state.pressedButtons[1]);
		scenes[state.currentScene].tracks[state.currentTrack].pattern[state.lastPressedStep].notes[(state.currentOctave * 12) + note] ^= true;
	}
};

exports.showNotes = (state,scenes) => {
	var step = cons.BIG_GRID.indexOf(state.pressedButtons[1]);
	if(state.pressedButtons.length == 2 && state.pressedButtons[0] == cons.SHIFT_BUTTON && step != -1
	   && step < scenes[state.currentScene].tracks[state.currentTrack].trackLength){
		state.lastPressedStep = step;
	}
};

exports.changeTrack = (state,scenes) => {
	if(state.pressedButtons.length == 1 && isMuteButton(state.pressedButtons[0])){
		var track = cons.MUTE_BUTTONS.indexOf(state.pressedButtons[0]) + (state.page * 8);
		state.currentTrack = track;
	}
};

exports.changePage = (state,scenes) => {
	var pageButtons = [cons.PAGE_0_BUTTON,cons.PAGE_1_BUTTON];
	if(state.pressedButtons.length == 1 && pageButtons.indexOf(state.pressedButtons[0]) != -1){
		var page = pageButtons.indexOf(state.pressedButtons[0]);
		state.page = page;
		state.currentTrack = (state.currentTrack % 8) + (page * 8);
	}
};

exports.toogleMute = (state,scenes) => {
	if(state.pressedButtons.length == 2 && state.pressedButtons[0] == cons.SHIFT_BUTTON && isMuteButton(state.pressedButtons[1])){
		var track = cons.MUTE_BUTTONS.indexOf(state.pressedButtons[1]) + (state.page * 8);
		scenes[state.currentScene].tracks[track].muted ^= true;
	}
};

exports.changeScene = (state,scenes) => {
	if(state.pressedButtons.length == 1 && isSceneButton(state.pressedButtons[0])){
		state.currentScene = cons.SCENE_BUTTONS.indexOf(state.pressedButtons[0]);
		resetSceneChain(state);
	}
};

exports.copyScene = (state,scenes) => {
	if(state.pressedButtons.length == 3 && state.pressedButtons[0] == cons.SHIFT_3_BUTTON && isSceneButton(state.pressedButtons[1]) && isSceneButton(state.pressedButtons[2])){
		var originScene = cons.SCENE_BUTTONS.indexOf(state.pressedButtons[1]);
		var targetScene = cons.SCENE_BUTTONS.indexOf(state.pressedButtons[2]);
		scenes[targetScene] = JSON.parse(JSON.stringify(scenes[originScene])); // Dirty trick for object deep copy by value
		io.blinkButton(11,cons.COLOR_BLINK,0);
	}
};

exports.copyTrack = (state,scenes) => {
	if(state.pressedButtons.length == 2 && state.pressedButtons[0] == cons.SHIFT_3_BUTTON && isMuteButton(state.pressedButtons[1])){
		var trackColors = [cons.COLOR_TRACK_1,cons.COLOR_TRACK_2,cons.COLOR_TRACK_3,cons.COLOR_TRACK_4, cons.COLOR_TRACK_5,cons.COLOR_TRACK_6,cons.COLOR_TRACK_7,cons.COLOR_TRACK_8,cons.COLOR_TRACK_9,cons.COLOR_TRACK_10,cons.COLOR_TRACK_11,cons.COLOR_TRACK_12,cons.COLOR_TRACK_13,cons.COLOR_TRACK_14,cons.COLOR_TRACK_15,cons.COLOR_TRACK_16];
		var bufferTrack = JSON.parse(JSON.stringify(scenes[state.currentScene].tracks[state.currentTrack]));
		var targetTrack = cons.MUTE_BUTTONS.indexOf(state.pressedButtons[1]) + (state.page * 8);
		bufferTrack.color = trackColors[targetTrack];
		bufferTrack.channel = targetTrack;
		scenes[state.currentScene].tracks[targetTrack] = bufferTrack;
		io.blinkButton(11,cons.COLOR_BLINK,0);
	}
};


exports.copyStep = (state,scenes) => {
	if(state.pressedButtons.length == 3 && state.pressedButtons[0] == cons.SHIFT_3_BUTTON && isBigGrid(state.pressedButtons[1]) && isBigGrid(state.pressedButtons[2])){
		var originStep = cons.BIG_GRID.indexOf(state.pressedButtons[1]);
		var targetStep = cons.BIG_GRID.indexOf(state.pressedButtons[2]);
		scenes[state.currentScene].tracks[state.currentTrack].pattern[targetStep] =
			JSON.parse(JSON.stringify(scenes[state.currentScene].tracks[state.currentTrack].pattern[originStep]));
		io.blinkButton(11,cons.COLOR_BLINK,0);
	}
};

exports.changeTempo = (state,scenes) => {
	if(state.pressedButtons.length == 1 && state.pressedButtons[0] == cons.TEMPO_BUTTON){
		var tempos = [1, 0.5, 0.25, 0.125];
		var trackTempo = scenes[state.currentScene].tracks[state.currentTrack].tempoModifier;
		scenes[state.currentScene].tracks[state.currentTrack].tempoModifier = tempos[(tempos.indexOf(trackTempo) + 1) % tempos.length];
	}
};

exports.chainScenes = (state,scenes) => {
	if(state.pressedButtons.length == 2 && state.pressedButtons[0] == cons.SHIFT_BUTTON && isSceneButton(state.pressedButtons[1])){
		var scene = cons.SCENE_BUTTONS.indexOf(state.pressedButtons[1]);
		state.chainMode = true;
		state.scenesChain.push(scene);
	}
};

exports.changeTrackLength = (state,scenes) => {
	var step = cons.BIG_GRID.indexOf(state.pressedButtons[1])
	if(state.pressedButtons.length == 2 && state.pressedButtons[0] == cons.SHIFT_2_BUTTON && step != -1){
		scenes[state.currentScene].tracks[state.currentTrack].trackLength = step + 1;
		state.lastPressedStep = step;
	}
};

exports.shiftPatternRight = (state,scenes) => {
	if(state.pressedButtons.length == 1 && state.pressedButtons[0] == cons.RIGHT_ARROW_BUTTON){
		var shiftedPattern = utils.shiftPatternRight(scenes[state.currentScene].tracks[state.currentTrack].pattern);
		utils.copyArray(shiftedPattern,scenes[state.currentScene].tracks[state.currentTrack].pattern);
	}
};

exports.shiftPatternLeft = (state,scenes) => {
	if(state.pressedButtons.length == 1 && state.pressedButtons[0] == cons.LEFT_ARROW_BUTTON){
		var shiftedPattern = utils.shiftPatternLeft(scenes[state.currentScene].tracks[state.currentTrack].pattern);
		utils.copyArray(shiftedPattern,scenes[state.currentScene].tracks[state.currentTrack].pattern);
	}
};

exports.randomPattern = (state,scenes) => {
	if(state.pressedButtons.length == 2 && state.pressedButtons[0] == cons.SHIFT_BUTTON && isArrowButton(state.pressedButtons[1])){
		var trackLength = Math.floor(Math.random() * 16) + 1; //range 1-16
		var randomPattern = utils.createRandomPattern(trackLength); //return string with binary representation of random pattern
		scenes[state.currentScene].tracks[state.currentTrack].trackLength = trackLength;
		randomPattern.split('').map((e,i) => scenes[state.currentScene].tracks[state.currentTrack].pattern[i].active = e == true);
	}
};

exports.toogleMode = (state,scenes) => {
	if(cons.CHORDS_MODE_ENABLED){
		switch(state.mode){
		case 'seq':
			state.mode = 'chords';
			break;
		case 'chords':
			state.mode = 'seq';
			break;
		default:
			break;
		}
		state.renderReset = true;
	}
};

exports.toogleSmallGridMode = (state,scenes) => {
	switch(state.smallGridMode){
	case 'length':
		state.smallGridMode = 'velocity';
		break;
	case 'velocity':
		state.smallGridMode = 'octave';
		break;
	case 'octave':
		state.smallGridMode = 'length';
		break;
	default:
		break;
	}
	state.renderReset = true;
};

exports.toogleChords = (state,scenes) => {
	if(state.pressedButtons.length == 1){
		var lastPressedButton = state.pressedButtons[state.pressedButtons.length - 1];
		var stepChords = scenes[state.currentScene].tracks[state.currentTrack].pattern[state.lastPressedStep].chords;
		if(stepChords.indexOf(lastPressedButton) == -1){
			scenes[state.currentScene].tracks[state.currentTrack].pattern[state.lastPressedStep].chords.push(lastPressedButton);
		}else{
			scenes[state.currentScene].tracks[state.currentTrack].pattern[state.lastPressedStep].chords = stepChords.filter(e => e != lastPressedButton);
		}
	}
};

exports.copyChord = (state,scenes) => {
	if(state.pressedButtons[0] == cons.TEMPO_BUTTON && state.pressedButtons.length == 2){
		var lastPressedButton = state.pressedButtons[state.pressedButtons.length - 1];
		const scale = scenes[state.currentScene].tracks[state.currentTrack].pattern[state.lastPressedStep].chordScale
		const chordInOctave = state.chords[scale][lastPressedButton].chord.map(note => (note - chords.midiRoot()) + state.currentOctave * 12);
		chordInOctave.map(note => scenes[state.currentScene].tracks[state.currentTrack].pattern[state.lastPressedStep].notes[note] = true);
	}
};

exports.changeChordMode = (state,scenes) => {
	if(state.chords[state.lastChordPressed] != undefined){
		const scale = scenes[state.currentScene].tracks[state.currentTrack].pattern[state.lastPressedStep].chordScale
		state.chords[scale][state.lastChordPressed].mode++;
		state.chords[scale][state.lastChordPressed].mode %= chords.modes.length;
	}
};

exports.changeChordPlayMode = (state,scenes) => {
	var lastPressedButton = state.pressedButtons[state.pressedButtons.length - 1];
	var chordPlayMode = cons.CHORD_PLAY_MODE_BUTTONS.indexOf(lastPressedButton);
	scenes[state.currentScene].tracks[state.currentTrack].pattern[state.lastPressedStep].chordPlayMode = chordPlayMode;
};

exports.changeGlobalChordPlayMode = (state,scenes) => {
	if(state.pressedButtons.length == 2 && state.pressedButtons[0] == cons.TEMPO_BUTTON){
		var lastPressedButton = state.pressedButtons[state.pressedButtons.length - 1];
		var chordPlayMode = cons.CHORD_PLAY_MODE_BUTTONS.indexOf(lastPressedButton);
		scenes[state.currentScene].tracks[state.currentTrack].pattern.map(step => step.chordPlayMode = chordPlayMode)
	}
};

exports.changeChordScale = (state,scenes) => {
	var lastPressedButton = state.pressedButtons[state.pressedButtons.length - 1];
	var chordScale = cons.CHORD_SCALE_BUTTONS.indexOf(lastPressedButton);
	scenes[state.currentScene].tracks[state.currentTrack].pattern[state.lastPressedStep].chordScale = chordScale;
};

exports.changeGlobalChordScale = (state,scenes) => {
	if(state.pressedButtons.length == 2 && state.pressedButtons[0] == cons.TEMPO_BUTTON){
		var lastPressedButton = state.pressedButtons[state.pressedButtons.length - 1];
		var chordScale = cons.CHORD_SCALE_BUTTONS.indexOf(lastPressedButton);
		scenes[state.currentScene].tracks[state.currentTrack].pattern.map(step => step.chordScale = chordScale)
	}
};

exports.changeLength = (state,scenes) => {
	if(state.smallGridMode == 'length' && state.pressedButtons.length == 1 && state.workspace > 1){
		var button = state.pressedButtons[0];
		var currentLength = scenes[state.currentScene].tracks[state.currentTrack].pattern[state.lastPressedStep].length;
		scenes[state.currentScene].tracks[state.currentTrack].pattern[state.lastPressedStep].length = calculateLength(button,currentLength);
	}
};

exports.globalChangeLength = (state,scenes) => {
	if(state.smallGridMode == 'length' && state.pressedButtons.length == 2 && state.pressedButtons[0] == cons.SHIFT_BUTTON && state.workspace > 1){
		var button = state.pressedButtons[1];
		var currentLength = scenes[state.currentScene].tracks[state.currentTrack].pattern[state.lastPressedStep].length;
		scenes[state.currentScene].tracks[state.currentTrack].pattern.map(s => s.length = calculateLength(button,currentLength));
	}
};

exports.changeVelocity = (state,scenes) => {
	if(state.smallGridMode == 'velocity' && state.pressedButtons.length == 1 && state.workspace > 1){
		var button = state.pressedButtons[0];
		scenes[state.currentScene].tracks[state.currentTrack].pattern[state.lastPressedStep].velocity = calculateVelocity(button);
	}
};

exports.globalChangeVelocity = (state,scenes) => {
	if(state.smallGridMode == 'velocity' && state.pressedButtons.length == 2 && state.pressedButtons[0] == cons.SHIFT_BUTTON && state.workspace > 1){
		var button = state.pressedButtons[1];
		scenes[state.currentScene].tracks[state.currentTrack].pattern.map(s => s.velocity = calculateVelocity(button));
	}
};

exports.changeOctave = (state,scenes) => {
	if(state.smallGridMode == 'octave' && state.pressedButtons.length == 1 && state.workspace > 1){
		var button = state.pressedButtons[0];
		state.currentOctave = cons.SMALL_GRID.indexOf(button);
	}
};

exports.toogleCursor = (state,scenes) => {
	if(state.pressedButtons.length == 3 && allButtonsAreShift(state.pressedButtons)){
		state.showCursor ^= true;
	}
};

exports.changeWorkspace = (state,scenes) => {
	state.workspace = (state.workspace + 1) % 3;
	state.renderReset = true;
};

exports.sendFreeMidi = (state,scenes) =>  {
	if(state.pressedButtons.length == 2 && state.pressedButtons[0] == cons.SHIFT_BUTTON){
		io.sendMidiCC(state.pressedButtons[1]);
		io.blinkButton(state.pressedButtons[1],cons.COLOR_BLINK,0);
	}
};

exports.shiftChordsRight = (state,scenes) =>  {
	scenes[state.currentScene].tracks[state.currentTrack].pattern.forEach(step => {
		const shiftedChords = step.chords.map(chord => {
			if(chord == 77) return 11;
			if((chord - 7) % 10 == 0) return chord + 4;
			return chord + 1
		});
		step.chords = shiftedChords
	});
};

exports.shiftChordsLeft = (state,scenes) =>  {
	scenes[state.currentScene].tracks[state.currentTrack].pattern.forEach(step => {
		const shiftedChords = step.chords.map(chord => {
			if(chord == 11) return 77;
			if((chord - 1) % 10 == 0) return chord - 4;
			return chord - 1
		});
		step.chords = shiftedChords
	});
};

exports.shiftChordsUp = (state,scenes) =>  {
	scenes[state.currentScene].tracks[state.currentTrack].pattern.forEach(step => {
		const shiftedChords = step.chords.map(chord => {
			if(chord >=  71) return chord - 60;
			return chord + 10
		});
		step.chords = shiftedChords
	});
};

exports.shiftChordsDown = (state,scenes) =>  {
	scenes[state.currentScene].tracks[state.currentTrack].pattern.forEach(step => {
		const shiftedChords = step.chords.map(chord => {
			if(chord <=  17) return chord + 60;
			return chord - 10
		});
		step.chords = shiftedChords
	});
};

const resetSceneChain = (state) => {
	state.chainMode = false;
	state.currentSceneInChain = 0;
	state.scenesChain = [];
};

const isBigGrid = (button) => {
	return cons.BIG_GRID.indexOf(button) != -1;
};

const isMuteButton = (button) => {
	return cons.MUTE_BUTTONS.indexOf(button) != -1;
};

const isSceneButton = (button) => {
	return cons.SCENE_BUTTONS.indexOf(button) != -1;
};

const isArrowButton = (button) => {
	return button == cons.RIGHT_ARROW_BUTTON || button == cons.LEFT_ARROW_BUTTON;
};

const calculateLength = (button, currentLength) => {
	if((cons.SMALL_GRID.indexOf(button) + 1) * 2 - 1 == currentLength){
		return currentLength % 2 == 1 ? currentLength + 1 : currentLength - 1;
	}
	return (cons.SMALL_GRID.indexOf(button) + 1) * 2 - 1;
};

const calculateVelocity = (button) => {
	return (127 / 8) * (cons.SMALL_GRID.indexOf(button) + 1);
};

const allButtonsAreShift = (buttons) => {
	const shiftButtons = [cons.SHIFT_BUTTON, cons.SHIFT_2_BUTTON, cons.SHIFT_3_BUTTON];
	return buttons.filter(e => shiftButtons.indexOf(e) != -1).length == 3;
};

const buttonsAreContinousInGrid = (pressedButtons) => {
	const firstButton = cons.BIG_GRID.indexOf(pressedButtons[0]);
	const secondButton = cons.BIG_GRID.indexOf(pressedButtons[1]);
	return firstButton - secondButton == -1 || firstButton - secondButton == cons.BIG_GRID.length - 1;
};

const stepIsInTriplet = (step,track) => {
	return track.pattern[step].triplet;
};

const stepsInSameTripletState = (pressedButtons,track) => {
	const firstStep = cons.BIG_GRID.indexOf(pressedButtons[0]);
	const secondStep = cons.BIG_GRID.indexOf(pressedButtons[1]);
	return (track.pattern[firstStep].triplet == track.pattern[secondStep].triplet) && !firstStep.doubleNote
		&& !firstStep.singleTriplet && !secondStep.doubleNote && !secondStep.singleTriplet;
};

const stepsCanToogleTriplet = (firstStep, secondStep, currentTrack) => {
	return currentTrack.pattern[firstStep].active && !currentTrack.pattern[secondStep].active;
};

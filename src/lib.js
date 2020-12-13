const cons = require('./constants');
const utils = require('./utils');

exports.toogleStep = (state,scenes) => {
	if(state.pressedButtons.length == 1 && isBigGrid(state.pressedButtons[0])){
		var step = cons.BIG_GRID.indexOf(state.pressedButtons[0]);
		state.lastPressedStep = step;
		scenes[state.currentScene].tracks[state.currentTrack].pattern[step].active ^= true;
	}
};

exports.toogleNote = (state,scenes) => {
	if(state.pressedButtons.length == 1 && cons.INNER_GRID.indexOf(state.pressedButtons[0]) != -1){
		var note = cons.INNER_GRID.indexOf(state.pressedButtons[0]);
		scenes[state.currentScene].tracks[state.currentTrack].pattern[state.lastPressedStep].notes[note] ^= true;
	}
};

exports.showNotes = (state,scenes) => {
	if(state.pressedButtons.length == 2 && state.pressedButtons[0] == cons.SHIFT_BUTTON && isBigGrid(state.pressedButtons[1])){
		state.lastPressedStep = cons.BIG_GRID.indexOf(state.pressedButtons[1]);
	}
};

exports.changeTrack = (state,scenes) => {
	if(state.pressedButtons.length == 2 && state.pressedButtons[0] == cons.SHIFT_BUTTON && isMuteButton(state.pressedButtons[1])){
		var track = cons.MUTE_BUTTONS.indexOf(state.pressedButtons[1]);
		state.currentTrack = track;
	}
};

exports.toogleMute = (state,scenes) => {
	if(state.pressedButtons.length == 1 && isMuteButton(state.pressedButtons[0])){
		var track = cons.MUTE_BUTTONS.indexOf(state.pressedButtons[0]);
		scenes[state.currentScene].tracks[track].muted ^= true;
	}
};

exports.changeScene = (state,scenes) => {
	if(state.pressedButtons.length == 1 && isSceneButton(state.pressedButtons[0])){
		var prevScene = state.currentScene;
		state.currentScene = cons.SCENE_BUTTONS.indexOf(state.pressedButtons[0]);
		resetSceneChain(state);
	}
};

exports.copyScene = (state,scenes) => {
	if(state.pressedButtons.length == 2 && isSceneButton(state.pressedButtons[0]) && isSceneButton(state.pressedButtons[1])){
		var originScene = cons.SCENE_BUTTONS.indexOf(state.pressedButtons[0]);
		var targetScene = cons.SCENE_BUTTONS.indexOf(state.pressedButtons[1]);
		scenes[targetScene] = JSON.parse(JSON.stringify(scenes[originScene])); // Dirty trick for object deep copy by value
	}
};

exports.changeTempo = (state,scenes) => {
	if(state.pressedButtons.length == 1 && state.pressedButtons[0] == cons.TEMPO_BUTTON){
		var tempos = [0.5, 1];
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
	if(state.pressedButtons.length == 2 && state.pressedButtons[0] == cons.SHIFT_2_BUTTON && isBigGrid(state.pressedButtons[1])){
		scenes[state.currentScene].tracks[state.currentTrack].trackLength = cons.BIG_GRID.indexOf(state.pressedButtons[1]) + 1;
	}
};

const resetSceneChain = (state) => {
	state.chainMode = false;
	state.currentSceneInChain = -1;
	state.scenesChain = [];
}

const isBigGrid = (button) => {
	return cons.BIG_GRID.indexOf(button) != -1;
};

const isMuteButton = (button) => {
	return cons.MUTE_BUTTONS.indexOf(button) != -1;
};

const isSceneButton = (button) => {
	return cons.SCENE_BUTTONS.indexOf(button) != -1;
};

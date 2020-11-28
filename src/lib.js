const cons = require('./constants');

exports.toogleStep = (button,state,scenes) => {
	var step = cons.BIG_GRID.indexOf(button);
	if(step != -1){
		scenes[state.currentScene].tracks[state.currentTrack].pattern[step].active ^= true;
		state.lastPressedStep = step;
	}
}

exports.toogleNote = (button,state,scenes) => {
	var note = cons.INNER_GRID.indexOf(button);
	scenes[state.currentScene].tracks[state.currentTrack].pattern[state.lastPressedStep].notes[note] ^= true;
}

exports.showNotes = (state,scenes) => {
	var step = cons.BIG_GRID.indexOf(state.pressedButtons[1]);
	if(step != -1 && state.pressedButtons[0] == cons.SHIFT_BUTTON){
		state.lastPressedStep = cons.BIG_GRID.indexOf(state.pressedButtons[1]);
	}
}

exports.changeTrack = (state,scenes) => {
	if(state.pressedButtons[0] = cons.SHIFT_BUTTON){
		var track = cons.MUTE_BUTTONS.indexOf(state.pressedButtons[1]);
		state.currentTrack = track;
	}
}

exports.toogleMute = (button,state,scenes) => {
	var track = cons.MUTE_BUTTONS.indexOf(button);
	if(track != -1){
		scenes[state.currentScene].tracks[track].muted ^= true;
	}
}

exports.changeScene = (button,state,scenes) => {
	var prevScene = state.currentScene;
	state.currentScene = cons.SCENE_BUTTONS.indexOf(button);
	resetSceneChain(state);
}

exports.copyScene = (state,scenes) => {
	var originScene = cons.SCENE_BUTTONS.indexOf(state.pressedButtons[0]);
	var targetScene = cons.SCENE_BUTTONS.indexOf(state.pressedButtons[1]);
	if(originScene != -1 && targetScene != -1){
		scenes[targetScene] = JSON.parse(JSON.stringify(scenes[originScene])); // Dirty trick for object deep copy by value
	}
}

exports.changeTempo = (button,state,scenes) => {
	var tempos = [0.5, 1];
	var trackTempo = scenes[state.currentScene].tracks[state.currentTrack].tempoModifier;
	scenes[state.currentScene].tracks[state.currentTrack].tempoModifier = tempos[(tempos.indexOf(trackTempo) + 1) % tempos.length];
}

exports.chainScenes = (state,scenes) => {
	if(state.pressedButtons[0] == cons.SHIFT_BUTTON){
		var scene = cons.SCENE_BUTTONS.indexOf(state.pressedButtons[1]);
		if(state.pressedButtons.length == 2 && state.pressedButtons[0] == cons.SHIFT_BUTTON && scene != -1){
			state.chainMode = true;
			state.scenesChain.push(scene);
		}
	}
}

exports.changeTrackLength = (state,scenes) => {
	if(state.pressedButtons[0] == cons.SHIFT_2_BUTTON){
		scenes[state.currentScene].tracks[state.currentTrack].trackLength = cons.BIG_GRID.indexOf(state.pressedButtons[1]) + 1;
	}
}

const resetSceneChain = (state) => {
	state.chainMode = false;
	state.currentSceneInChain = -1;
	state.scenesChain = [];
}

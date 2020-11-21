exports.toogleStep = (button,state,scenes) => {
	state.lastPressedStep = scenes[state.currentScene].tracks[state.currentTrack].grid.indexOf(button);
	var step = scenes[state.currentScene].tracks[state.currentTrack].grid.indexOf(button);
	if(step != -1){
		scenes[state.currentScene].tracks[state.currentTrack].pattern[step].active ^= true;
	}
}

exports.toogleNote = (button,state,scenes) => {
	var note = state.innerGrid.indexOf(button);
	scenes[state.currentScene].tracks[state.currentTrack].pattern[state.lastPressedStep].notes[note] ^= true;
}

exports.showNotes = (pressedButtons,state,scenes) => {
	var step = bigGrid.indexOf(pressedButtons[1]);
	if(step != -1 && pressedButtons[0] == SHIFT_BUTTON){
		state.lastPressedStep = scenes[state.currentScene].tracks[state.currentTrack].grid.indexOf(pressedButtons[1]);
	}
}

exports.changeTrack = (button,state,scenes) => {
	state.currentTrack = (state.currentTrack + 1) % scenes[state.currentScene].tracks.length;
}

exports.toogleMute = (button,state,scenes) => {
	var track = state.muteButtons.indexOf(button);
	if(track != -1){
		scenes[state.currentScene].tracks[track].muted = !scenes[state.currentScene].tracks[track].muted;
	}
}

exports.changeScene = (button,state,scenes) => {
	var prevScene = state.currentScene;
	state.currentScene = state.sceneButtons.indexOf(button);
	resetSceneChain(state);
}

exports.copyScene = (state,scenes) => {
	var originScene = state.sceneButtons.indexOf(state.pressedButtons[0]);
	var targetScene = state.sceneButtons.indexOf(state.pressedButtons[1]);
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
	/*
	var scene = state.sceneButtons.indexOf(state.pressedButtons[1]);
	if(state.pressedButtons.length == 2 && state.pressedButtons[0] == SHIFT_BUTTON && scene != -1){
		state.chainMode = true;
		state.scenesChain.push(scene);
	}
	*/
}

const resetSceneChain = (state) => {
	state.chainMode = false;
	state.currentSceneInChain = -1;
	state.scenesChain = [];
}

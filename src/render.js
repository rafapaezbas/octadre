const utils = require('./utils');
const header = [ 240, 00, 32, 41, 2, 24,10 ];

exports.render = (output,scenes,state) => {
	var sysex = []
	var stepsMessage = generateStepsMessage(scenes,state);
	var mutesMessage = generateMutesMessage(scenes,state);
	var notesMessage = generateNotesMessage(scenes,state);
	var scenesMessage = generateScenesMessage(scenes,state);
	var message = sysex.concat(header).concat(stepsMessage).concat(mutesMessage).concat(scenesMessage).concat(notesMessage).concat([247]);
	output.send('sysex',message);
	return message;
};

// TODO improve this, please.
exports.lightCurrentStep = (output,state,scenes) => { 
	var modCurrentStep = state.currentStep * scenes[state.currentScene].tracks[state.currentTrack].tempoModifier;
	var prevStep = modCurrentStep != 0 ? modCurrentStep - 1 : 15;
	if(utils.isInt(modCurrentStep)){
		var sysex = [];
		var message = sysex.concat(header).concat(resetStepMessage((prevStep) % 16,state, scenes)).concat([state.bigGrid[modCurrentStep % 16],10]).concat([247]);
		output.send('sysex',message);
		return message;
	}

}

const generateStepsMessage = (scenes,state) => {
	return scenes[state.currentScene].tracks[state.currentTrack].pattern.reduce((acc,e,i) => {
		acc.push(state.bigGrid[i]);
		e.active ? acc.push(100) : acc.push(scenes[state.currentScene].tracks[state.currentTrack].color);
		return acc;
	},[]);
};

const generateNotesMessage = (scenes,state) => {
	return scenes[state.currentScene].tracks[state.currentTrack].pattern[state.lastPressedStep].notes.reduce((acc,e,i) => {
		acc.push(state.innerGrid[i]);
		e ? acc.push(7) : acc.push(40);
		return acc;
	},[]);
};

const generateMutesMessage = (scenes,state) => {
	return scenes[state.currentScene].tracks.reduce((acc,e,i) => {
		acc.push(state.muteButtons[i]);
		e.muted ? acc.push(0) : acc.push(e.color);
		return acc;
	},[]);
};

const generateScenesMessage = (scenes,state) => {
	return state.sceneButtons.reduce((acc,e, i) => {
		acc.push(e);
		i == state.currentScene ? acc.push(100) : acc.push(80);
		return acc;
	},[]);
};

const resetStepMessage = (step,state,scenes) => {
	var trackColor = scenes[state.currentScene].tracks[state.currentTrack].color;
	var color = scenes[state.currentScene].tracks[state.currentTrack].pattern[step].active ? 100 : trackColor;
	return [state.bigGrid[step], color];
}


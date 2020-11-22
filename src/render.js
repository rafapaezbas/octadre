exports.render = (output,scenes,state) => {
	var sysex = []
	var header = [ 240, 00, 32, 41, 2, 24,10 ];
	var stepsMessage = generateStepsMessage(scenes,state);
	var mutesMessage = generateMutesMessage(scenes,state);
	var notesMessage = generateNotesMessage(scenes,state);
	var scenesMessage = generateScenesMessage(scenes,state);
	var message = sysex.concat(header).concat(stepsMessage).concat(mutesMessage).concat(scenesMessage).concat(notesMessage).concat([247]);
	output.send('sysex',message);
	return message;
};

var generateStepsMessage = (scenes,state) => {
	return scenes[state.currentScene].tracks[state.currentTrack].pattern.reduce((acc,e,i) => {
		acc.push(state.bigGrid[i]);
		e.active ? acc.push(100) : acc.push(scenes[state.currentScene].tracks[state.currentTrack].color);
		return acc;
	},[]);
};

var generateNotesMessage = (scenes,state) => {
	return scenes[state.currentScene].tracks[state.currentTrack].pattern[state.lastPressedStep].notes.reduce((acc,e,i) => {
		acc.push(state.innerGrid[i]);
		e ? acc.push(7) : acc.push(40);
		return acc;
	},[]);
};

var generateMutesMessage = (scenes,state) => {
	return scenes[state.currentScene].tracks.reduce((acc,e,i) => {
		acc.push(state.muteButtons[i]);
		e.muted ? acc.push(0) : acc.push(e.color);
		return acc;
	},[]);
};

var generateScenesMessage = (scenes,state) => {
	return state.sceneButtons.reduce((acc,e, i) => {
		acc.push(e);
		i == state.currentScene ? acc.push(100) : acc.push(80);
		return acc;
	},[]);
};

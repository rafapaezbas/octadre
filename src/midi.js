const async = require('async');


exports.playNextStep = (state,scenes,output) => {
	var tasks = [];
	sendNoteOn(state,scenes,output,tasks);
	sendNoteOff(state,output,tasks);
	async.parallel(tasks,(error,results) => {});
}

exports.resetClock = (state) => {
	if(state.resetClockTimeout != undefined){
		clearTimeout(state.resetClockTimeout);
	}
	state.resetClockTimeout = setTimeout(() => {
		state.clockTick = -1;
		state.currentStep = 0;
	},500);

};

const sendNoteOn = (state,scenes,output, tasks) => {
	var scene = getPlayingScene(state);
	scenes[scene].tracks.map(t => {
		var trackCurrentStep = (state.currentStep * t.tempoModifier);
		var step = t.pattern[trackCurrentStep % t.trackLength];
		if(step != undefined && step.active && !t.muted){
			step.notes.map((n,i) => {
				if(n) {
					tasks.push((callback) => {
						output.send('noteon', {note: t.midiRoot + i,velocity: 127,channel: t.channel});
						state.midiNotesQueue.push({clockTick: state.clockTick, length: 1, note: t.midiRoot + i, channel: t.channel});
						callback();
					});
				}
			});
		}
	});
};

const sendNoteOff = (state,output,tasks) => {
	state.midiNotesQueue.map((e) => {
		if(state.clockTick - e.clockTick >= e.length * state.clockResolution) {
			tasks.push((callback) => {
				output.send('noteoff', {note: e.note ,velocity: 127,channel: e.channel});
				callback();
			});
		}
	});
	state.midiNotesQueue = state.midiNotesQueue.filter(e => state.clockTick - e.clockTick < e.length * state.clockResolution);
};

const getPlayingScene = (state) => {
	var shouldChange = state.clockTick % (6*16) == 0;
	var nextScene = !shouldChange ? state.scenesChain[state.currentSceneInChain % state.scenesChain.length] : state.scenesChain[state.currentSceneInChain++ % state.scenesChain.length];
	return state.chainMode ? nextScene : state.currentScene;
}


const async = require('async');
const chords = require('./chords');

exports.playNextStep = (state,scenes,output) => {
	sendNoteOff(state,output);
	sendNoteOn(state,scenes,output);
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

const sendNoteOn = (state,scenes,output) => {
	var tasks = [];
	var scene = getPlayingScene(state);
	scenes[scene].tracks.map(t => {
		var trackCurrentStep = (state.currentStep * t.tempoModifier);
		var step = t.pattern[trackCurrentStep % t.trackLength];
		if(step != undefined && step.active && !t.muted){
			playStep(t,step,state,output,tasks);
			playChord(t,step,state,output,tasks);
			async.parallel(tasks,(error,results) => {});
		}
	});
};

const playStep = (track,step,state,output,tasks) => {
	step.notes.map((n,i) => {
		if(n) {
			tasks.push((callback) => {
				output.send('noteon', {note: track.midiRoot + i,velocity: 127,channel: track.channel});
				state.midiNotesQueue.push({clockTick: state.clockTick, length: step.length, note: track.midiRoot + i, channel: track.channel});
				callback();
			});
		}
	});
};

const playChord = (track,step,state,output,tasks) => {
		//var finalChord =chord.inversion.filter((e,i) => chords.filterByMode(i,chord.mode));
		//finalChord.map(n => output.send('noteon', {note:n, velocity:127, channel:state.currentTrack}));
	step.chords.map(n => {
		var chord = state.chords[n];
		state.chords[n].inversion.filter((e,i) => chords.filterByMode(i,chord.mode)).map(e => {
			tasks.push((callback) => {
				output.send('noteon', {note: e,velocity: 127,channel: track.channel});
				state.midiNotesQueue.push({clockTick: state.clockTick, length: step.length, note: e, channel: track.channel});
				callback();
			});
		});
	});
};

const sendNoteOff = (state,output) => {
	var tasks = [];
	state.midiNotesQueue.map((e) => {
		if(state.clockTick - e.clockTick >= e.length * state.clockResolution) {
			tasks.push((callback) => {
				output.send('noteoff', {note: e.note ,velocity: 127,channel: e.channel});
				callback();
			});
		}
	});
	state.midiNotesQueue = state.midiNotesQueue.filter(e => state.clockTick - e.clockTick < e.length * state.clockResolution);
	async.parallel(tasks,(error,results) => {});
};

const getPlayingScene = (state) => {
	var shouldChange = state.clockTick % (6*16) == 0;
	var nextScene = !shouldChange ? state.scenesChain[state.currentSceneInChain % state.scenesChain.length] : state.scenesChain[state.currentSceneInChain++ % state.scenesChain.length];
	return state.chainMode ? nextScene : state.currentScene;
}

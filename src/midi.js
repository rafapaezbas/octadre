const async = require('async');
const chords = require('./chords');
const render = require('./render');
const io = require('./midi-io.js');

exports.nextStep = (state,scenes) => {
	queueMidiNotes(state,scenes);
	checkSceneChange(state,scenes);
};

exports.sendMidi = (state) => {
	sendNoteOff(state);
	sendNoteOn(state);
};

exports.resetClock = (state) => {
	if(state.resetClockTimeout != undefined){
		clearTimeout(state.resetClockTimeout);
	}
	state.resetClockTimeout = setTimeout(() => {
		state.clockTick = -1;
		state.currentStep = 0;
	},500);
};

const queueMidiNotes = (state,scenes) => {
	var scene = getPlayingScene(state);
	scenes[scene].tracks.map(t => {
		var trackCurrentStep = (state.currentStep * t.tempoModifier);
		var step = t.pattern[trackCurrentStep % t.trackLength];
		if(step != undefined && step.active && !t.muted){
			queueStep(t,step,state);
			queueChord(t,step,state);
		}
	});
};

const queueStep = (track,step,state) => {
	step.notes.map((n,i) => {
		if(n){
			if(!step.triplet) {
				state.midiNotesQueue.push({clockTick: state.clockTick, length: step.length / track.tempoModifier, note: track.midiRoot + i, channel: track.channel, velocity: step.velocity });
			}else{
				state.midiNotesQueue.push({clockTick: state.clockTick, length: 4, note: track.midiRoot + i, channel: track.channel, velocity: step.velocity });
				state.midiNotesQueue.push({clockTick: state.clockTick + 4, length: 4, note: track.midiRoot + i, channel: track.channel, velocity: step.velocity });
				state.midiNotesQueue.push({clockTick: state.clockTick + 8, length: 4 , note: track.midiRoot + i, channel: track.channel, velocity: step.velocity });
			}
		}
	});
};

const queueChord = (track,step,state) => {
	step.chords.map(n => {
		var chord = state.chords[n];
		state.chords[n].inversion.filter((e,i) => chords.filterByMode(i,chord.mode)).map(e => {
			state.midiNotesQueue.push({clockTick: state.clockTick, length: step.length / track.tempoModifier, note: e, channel: track.channel, velocity: step.velocity});
		});
	});
};

const sendNoteOn = (state,scenes) => {
	var tasks = [];
	state.midiNotesQueue.map((e) => {
		if(state.clockTick == e.clockTick) {
			tasks.push((callback) => {
				io.output.send('noteon', {note: e.note ,velocity: e.velocity,channel: e.channel});
				callback();
			});
		}
	});
	state.midiNotesQueue = state.midiNotesQueue.filter(e => state.clockTick - e.clockTick < e.length * state.clockResolution);
	async.parallel(tasks,(error,results) => {});
};


const sendNoteOff = (state) => {
	var tasks = [];
	state.midiNotesQueue.map((e) => {
		if(state.clockTick - e.clockTick >= e.length * state.clockResolution) {
			tasks.push((callback) => {
				io.output.send('noteoff', {note: e.note ,velocity: 0,channel: e.channel});
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
	return state.chainMode && shouldChange ? nextScene : state.currentScene;
};

const checkSceneChange = (state,scenes) => {
	if(state.chainMode && state.clockTick % (6*16) == 0){
		state.currentScene = state.scenesChain[state.currentSceneInChain % state.scenesChain.length];
		render.render(scenes,state);
	}
};

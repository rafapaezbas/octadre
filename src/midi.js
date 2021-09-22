const async = require('async');
const chords = require('./chords');
const render = require('./render');
const io = require('./midi-io');

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
	var scene = getPlayingScene(state,scenes);
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
			playStep(step,track,state, i, state.clockTick);
		}
	});
};

const queueChord = (track,step,state) => {
	step.chords.map(n => {
		var chord = state.chords[step.chordScale][n];
		switch (step.chordPlayMode) {
		case 0:
			playChord(n,track,step,state,chord);
			break;
		case 1:
			arpChord(n,track,step,state,chord);
			break;
		case 2:
			arpDownChord(n,track,step,state,chord);
			break;
		case 3:
			arpDownFastChord(n,track,step,state,chord);
			break;
		case 4:
			arpFastChord(n,track,step,state,chord);
			break;
		case 5:
			arpRandomChord(n,track,step,state,chord);
			break;
		}
	});
};

const playChord = (stepChord,track,step,state,chord) => {
	state.chords[step.chordScale][stepChord].inversion.filter((e,i) => chords.filterByMode(i,chord.mode)).map(note => {
		playStep(step,track,state,note + (track.midiRoot - 60), state.clockTick);
	});
};

const arpChord = (stepChord,track,step,state,chord) => {
	state.chords[step.chordScale][stepChord].inversion.filter((e,i) => chords.filterByMode(i,chord.mode)).map((note,i) => {
		playStep(step,track,state,note + (track.midiRoot - 60), state.clockTick + i * (6 / track.tempoModifier));
	});
};

const arpDownChord = (stepChord,track,step,state,chord) => {
	state.chords[step.chordScale][stepChord].inversion.filter((e,i) => chords.filterByMode(i,chord.mode)).reverse().map((note,i) => {
		playStep(step,track,state,note + (track.midiRoot - 60), state.clockTick + i * (6 / track.tempoModifier));
	});
};

const arpFastChord = (stepChord,track,step,state,chord) => {
	state.chords[step.chordScale][stepChord].inversion.filter((e,i) => chords.filterByMode(i,chord.mode)).map((note,i) => {
		playStep(step,track,state,note + (track.midiRoot - 60), state.clockTick + i);
	});
};

const arpDownFastChord = (stepChord,track,step,state,chord) => {
	state.chords[step.chordScale][stepChord].inversion.filter((e,i) => chords.filterByMode(i,chord.mode)).reverse().map((note,i) => {
		playStep(step,track,state,note + (track.midiRoot - 60), state.clockTick + i);
	});
};

const arpRandomChord = (stepChord,track,step,state,chord) => {
	state.chords[step.chordScale][stepChord].inversion.filter((e,i) => chords.filterByMode(i,chord.mode)).sort(() => Math.random() > .5 ? 1 : -1).map((note,i) => {
		playStep(step,track,state,note + (track.midiRoot - 60), state.clockTick + i * (6 / track.tempoModifier));
	});
};

const sendNoteOn = (state,scenes) => {
	var tasks = [];
	state.midiNotesQueue.map((e) => {
		if(state.clockTick == e.clockTick) {
			tasks.push((callback) => {
				io.getOutput().send('noteon', {note: e.note ,velocity: e.velocity,channel: e.channel});
				callback();
			});
		}
	});
	async.parallel(tasks,(error,results) => {});
};


const sendNoteOff = (state) => {
	var tasks = [];
	state.midiNotesQueue.map((e) => {
		if(state.clockTick - e.clockTick >= e.length * state.clockResolution) {
			tasks.push((callback) => {
				io.getOutput().send('noteoff', {note: e.note ,velocity: 0,channel: e.channel});
				callback();
			});
		}
	});
	state.midiNotesQueue = state.midiNotesQueue.filter(e => state.clockTick - e.clockTick < e.length * state.clockResolution);
	async.parallel(tasks,(error,results) => {});
};

const getPlayingScene = (state,scenes) => {
	var shouldChange = state.clockTick % (6 * (16 / getSlowestTrackTempoModifier(state, scenes))) == 0;
	var nextScene = !shouldChange ? state.scenesChain[state.currentSceneInChain % state.scenesChain.length] : state.scenesChain[++state.currentSceneInChain % state.scenesChain.length];
	return state.chainMode && shouldChange ? nextScene : state.currentScene;
};

const checkSceneChange = (state,scenes) => {
	if(state.chainMode && state.clockTick % (6 * (16 /getSlowestTrackTempoModifier(state, scenes))) == 0){
		state.currentScene = state.scenesChain[state.currentSceneInChain % state.scenesChain.length];
		render.render(scenes,state);
	}
};

const getSlowestTrackTempoModifier = (state, scenes) => {
	const tempoModifiers = scenes[state.currentScene].tracks.map(t => t.tempoModifier)
	return Math.min(...tempoModifiers);
};

const playStep = (step,track,state,note, clockTick) => {
	if(step.triplet) {
		state.midiNotesQueue.push({clockTick: clockTick, length: 4 / track.tempoModifier, note: note, channel: track.channel, velocity: step.velocity });
		state.midiNotesQueue.push({clockTick: clockTick + (4 / track.tempoModifier), length: 4 / track.tempoModifier, note: note, channel: track.channel, velocity: step.velocity });
		state.midiNotesQueue.push({clockTick: clockTick + (8 / track.tempoModifier), length: 4 / track.tempoModifier, note: note, channel: track.channel, velocity: step.velocity });
	}else if(step.singleTriplet){
		state.midiNotesQueue.push({clockTick: clockTick, length: 2 / track.tempoModifier, note: note, channel: track.channel, velocity: step.velocity });
		state.midiNotesQueue.push({clockTick: clockTick + (2 / track.tempoModifier), length: 2 / track.tempoModifier, note: note, channel: track.channel, velocity: step.velocity });
		state.midiNotesQueue.push({clockTick: clockTick + (4 / track.tempoModifier), length: 2 / track.tempoModifier, note: note, channel: track.channel, velocity: step.velocity });
	}else if(step.doubleNote){
		state.midiNotesQueue.push({clockTick: clockTick, length: 4 / track.tempoModifier, note: note, channel: track.channel, velocity: step.velocity });
		state.midiNotesQueue.push({clockTick: clockTick + (3 / track.tempoModifier), length: 4 / track.tempoModifier, note: note, channel: track.channel, velocity: step.velocity });
	}else{
		state.midiNotesQueue.push({clockTick: clockTick, length: step.length / track.tempoModifier, note: note, channel: track.channel, velocity: step.velocity });
	}
}

const async = require('async');

exports.playNextStep = (state,scenes,output) => {
	var tasks = [];
	var scene = getPlayingScene(state);
	scenes[scene].tracks.map(t => {
		var trackCurrentStep = (state.currentStep * t.tempoModifier);
		var step = t.pattern[trackCurrentStep % 16];
		if(step != undefined && step.active && !t.muted){
			step.notes.map((n,i) => {
				if(n) {
					tasks.push((callback) => {
						output.send('noteon', {note: t.midiRoot + i,velocity: 127,channel: t.channel});
						callback();
					});
				}
			});
		}
	});
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

}

const getPlayingScene = (state) => {
	var shouldChange = state.clockTick % (6*16) == 0;
	var nextScene = !shouldChange ? state.scenesChain[state.currentSceneInChain % state.scenesChain.length] : state.scenesChain[state.currentSceneInChain++ % state.scenesChain.length];
	return state.chainMode ? nextScene : state.currentScene;
}


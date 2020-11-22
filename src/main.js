const easymidi = require('easymidi');
const utils = require('./utils');
const render = require('./render');
const lib = require('./lib');
const midi = require('./midi');

const configuration = utils.config('config.conf');

const bigGrid = [14,23,32,41,51,62,73,84,85,76,67,58,48,37,26,15];
const innerGrid = [24,33,42,52,63,74,75,66,57,47,36,25];

const CHANGE_TRACK_BUTTON = configuration.getIntOrDefault("CHANGE_TRACK_BUTTON",11);
const MUTE_0_BUTTON = configuration.getIntOrDefault("MUTE_0_BUTTON",89); 
const MUTE_1_BUTTON = configuration.getIntOrDefault("MUTE_1_BUTTON",79); 
const MUTE_2_BUTTON = configuration.getIntOrDefault("MUTE_2_BUTTON",69); 
const MUTE_3_BUTTON = configuration.getIntOrDefault("MUTE_3_BUTTON",59); 
const MUTE_4_BUTTON = configuration.getIntOrDefault("MUTE_4_BUTTON",49); 
const MUTE_5_BUTTON = configuration.getIntOrDefault("MUTE_5_BUTTON",39); 
const MUTE_6_BUTTON = configuration.getIntOrDefault("MUTE_6_BUTTON",29); 
const MUTE_7_BUTTON = configuration.getIntOrDefault("MUTE_7_BUTTON",19); 
const SCENE_0_BUTTON = configuration.getIntOrDefault("SCENE_0_BUTTON",54); 
const SCENE_1_BUTTON = configuration.getIntOrDefault("SCENE_1_BUTTON",55); 
const SCENE_2_BUTTON = configuration.getIntOrDefault("SCENE_2_BUTTON",44); 
const SCENE_3_BUTTON = configuration.getIntOrDefault("SCENE_3_BUTTON",45); 
const SHIFT_BUTTON = configuration.getIntOrDefault("SHIFT_BUTTON",18); 
const TEMPO_BUTTON = configuration.getIntOrDefault("TEMPO_BUTTON",88); 

const GREEN = 26;
const YELLOW = 100;
const BLUE = 77;
const ORANGE = 10;
const PURPLE = 80;
const WHITE = 40;
const RED = 7;
const GREY = 90;
const PINK = 4;
const LIGHT_ORANGE = 8;
const DARK_GREEN = 19;
const LIGHT_GREEN = 20;


const launchpadOutput = new easymidi.Output(utils.getLaunchpadPort(easymidi.getOutputs()))
const input = new easymidi.Input(utils.getLaunchpadPort(easymidi.getInputs()));
const output = new easymidi.Output(utils.getNormalPort(easymidi.getOutputs()));
const clockInput = new easymidi.Input(utils.getNormalPort(easymidi.getInputs()));

const scenes = [];
for(var i = 0; i < 4; i++){
	scenes[i] = {tracks:[]};
	scenes[i].tracks[0] = { grid:bigGrid, pattern:[], midiRoot:64, color: GREEN, muted: false, tempoModifier: 1, channel: 0};
	scenes[i].tracks[1] = { grid:bigGrid, pattern:[], midiRoot:64, color: PURPLE, muted: false, tempoModifier: 1, channel: 1};
	scenes[i].tracks[2] = { grid:bigGrid, pattern:[], midiRoot:64, color: BLUE, muted: false, tempoModifier: 1, channel: 2};
	scenes[i].tracks[3] = { grid:bigGrid, pattern:[], midiRoot:64, color: WHITE, muted: false, tempoModifier: 1, channel: 3};
	scenes[i].tracks[4] = { grid:bigGrid, pattern:[], midiRoot:64, color: LIGHT_ORANGE, muted: false, tempoModifier: 1, channel: 4};
	scenes[i].tracks[5] = { grid:bigGrid, pattern:[], midiRoot:64, color: DARK_GREEN, muted: false, tempoModifier: 1, channel: 5};
	scenes[i].tracks[6] = { grid:bigGrid, pattern:[], midiRoot:64, color: LIGHT_GREEN, muted: false, tempoModifier: 1, channel: 6};
	scenes[i].tracks[7] = { grid:bigGrid, pattern:[], midiRoot:64, color: PINK, muted: false, tempoModifier: 1, channel: 7};
}

scenes.map(s => {
	s.tracks.map(t => {
		for(var i = 0; i < 16; i++){
			t.pattern.push({active:false, notes:[1,0,0,0,0,0,0,0,0,0,0,0,0]}); // Default note is root

		}
	})
});

var state =  {
	pressedButtons:[],
	currentStep:0,
	currentTrack:0,
	currentScene:0,
	lastPressedStep:0,
	scenesChain:[],
	currentSceneInChain:-1,
	chainMode:false,
	bigGrid : bigGrid,
	innerGrid : innerGrid,
	clockTick : -1,
	resetClockTimeout : undefined,
	muteButtons : [MUTE_0_BUTTON,MUTE_1_BUTTON,MUTE_2_BUTTON,MUTE_3_BUTTON,MUTE_4_BUTTON,MUTE_5_BUTTON,MUTE_6_BUTTON,MUTE_7_BUTTON],
	sceneButtons : [SCENE_0_BUTTON,SCENE_1_BUTTON,SCENE_2_BUTTON,SCENE_3_BUTTON],
};

clockInput.on('clock', function () {
	state.clockTick++;
	midi.resetClock(state);
	if(state.clockTick % 6 == 0){
		//lightNextStep();
		midi.playNextStep(state,scenes,output);
		state.currentStep++;
	}
});

input.on('noteon', (message) => {
	var pressed = message.velocity == 127;
	var button = message.note;
	state.pressedButtons.push(button);
	if(pressed && state.pressedButtons.length == 1 && controller[button] != undefined){
		controller[button](button,state,scenes);
	}
	if(pressed && state.pressedButtons.length > 1 && secondaryController[state.pressedButtons[1]] != undefined){
		secondaryController[button].map(f => f(state,scenes));
	}
	if(!pressed){
		state.pressedButtons = state.pressedButtons.filter(b => b != button);
	}else{
		render.render(launchpadOutput,scenes,state);
	}
});

// Setup simple controller
var controller = [];
controller[TEMPO_BUTTON] = lib.changeTempo;
controller[CHANGE_TRACK_BUTTON] = lib.changeTrack;
controller[MUTE_0_BUTTON] = lib.toogleMute;
controller[MUTE_1_BUTTON] = lib.toogleMute;
controller[MUTE_2_BUTTON] = lib.toogleMute;
controller[MUTE_3_BUTTON] = lib.toogleMute;
controller[MUTE_4_BUTTON] = lib.toogleMute;
controller[MUTE_5_BUTTON] = lib.toogleMute;
controller[MUTE_6_BUTTON] = lib.toogleMute;
controller[MUTE_7_BUTTON] = lib.toogleMute;
controller[SCENE_0_BUTTON] = lib.changeScene;
controller[SCENE_1_BUTTON] = lib.changeScene;
controller[SCENE_2_BUTTON] = lib.changeScene;
controller[SCENE_3_BUTTON] = lib.changeScene;
bigGrid.map(e => controller[e] = lib.toogleStep);
innerGrid.map(e => controller[e] = lib.toogleNote);

//Setup secondary controller, this controller is for multi-button presses
var secondaryController = [];
secondaryController[SCENE_0_BUTTON] = [lib.copyScene,lib.chainScenes];
secondaryController[SCENE_1_BUTTON] = [lib.copyScene,lib.chainScenes];
secondaryController[SCENE_2_BUTTON] = [lib.copyScene,lib.chainScenes];
secondaryController[SCENE_3_BUTTON] = [lib.copyScene,lib.chainScenes];
bigGrid.map(e => secondaryController[e] = [lib.showNotes]);

//Initial render
render.render(launchpadOutput,scenes,state);

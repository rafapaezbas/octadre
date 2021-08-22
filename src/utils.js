var randomGen = require('random-seed');
const easymidi = require('easymidi');

exports.getLaunchpadPort = (ports) => {
	for(var i = 0; i < ports.length; i++){
		if(ports[i].indexOf('Launchpad') != -1){
			return ports[i];
		}
	}
	console.log('No MK2:Launchpad midi i/o found');
};


exports.getOutputPort = (port) => {
	const ports = easymidi.getOutputs();
	console.log('Midi output: ' + ports[port]);
	return ports[port];
};

exports.getInputPort = (port) => {
	const ports = easymidi.getInputs();
	console.log('Midi input: ' + ports[port]);
	return ports[port];
};


exports.random = (max) => {
	return random(max);
};

exports.randomInitState = () => {
	return random.initState();
};

exports.substractArray = (a,b) => {
	return a.map((e,i) => e - b[i]);
};

exports.copyArray = (or,dest) => {
	for(var i = 0; i < or.length; i++){
		dest[i] = or[i];
	}
};

exports.isInt = (n) => {
	return Number(n) === n && n % 1 === 0;
};

exports.shiftPatternRight = (arr) => {
	arr.unshift(arr[arr.length - 1]); //Insert last element as first
	arr.pop(); //Remove last
	return arr;
};

exports.shiftPatternLeft = (arr) => {
	arr.push(arr[0]); //Push first element in the end
	arr.shift(); //Remove first
	return arr;
};

exports.createRandomPattern = (patternLength) => {
	var max = 2 ** patternLength - 1;
	var pattern = Math.floor(Math.random() * max).toString(2);
	var completePattern = '0'.repeat(patternLength - pattern.length) + pattern;
	return completePattern;
};

exports.generateGrid = () => {
	var grid = [];
	for(var i = 0; i < 8; i++){
		for(var j = 0; j < 8; j++){
			grid.push(11 + (i * 10) + j);
		}
	}
	return grid;
};

exports.generateChordGrid = () => {
	var chordGrid = [];
	for(var i = 0; i < 7; i++){
		for(var j = 0; j < 7; j++){
			chordGrid.push(11 + (i * 10) + j);
		}
	}
	return chordGrid;
};

exports.config = (path) => {
	var config = initConfig(path);
	return {
		getString : (key) => config[key],
		getInt : (key) => parseInt(config[key]),
		getArray : (key) => config[key].split(','),
		getIntOrDefault : (key,defaultValue) => isNaN(parseInt(config[key])) ? defaultValue : parseInt(config[key]),
		getArrayOrDefault : (key,length,defaultValue) => config[key].split(',').length != length ? defaultValue : config[key].split(',').map(e => parseInt(e,10)),
	};
};

var initConfig = (path) => {
	var file = require('fs').readFileSync(path, 'utf-8').split(/\r?\n/);
	file.pop();  //Remove last item because is always undefined (last line break)
	var config = [];
	file.map(line => {
		if(line[0] != '#' && line.length > 0){ // This means line is a comment or blank
			var key = line.split('=')[0].trim();
			var value = line.split('=')[1].trim();
			config[key] = value;
		}
	});
	return config;
};

exports.createArray = (length,fill) => {
	var arr = [];
	arr.length = length;
	arr.fill(fill);
	return arr;
};

//var random = randomGen.create(arg("--random-seed"));
const seed = Math.random().toString(36).substr(2, 5);
var random = randomGen.create(seed);

const utils = require('./utils');

const root = 60;

const scales = [];
scales[0] = [1,0,1,0,1,1,0,1,0,1,0,1]; // Major scale
scales[1] = [1,0,1,1,0,1,0,1,1,0,1,0]; // Minor scale
scales[2] = [1,0,0,1,0,1,1,1,0,0,1,0]; // Blues scale
scales[3] = [1,0,1,1,0,0,1,1,0,1,0,1]; // Made-up scale
scales[4] = [1,0,1,0,1,1,1,0,1,0,1,0]; // Minor scale

const grades = [];
grades[0] = [1,3,5,7,9];
grades[1] = [2,4,6,8,10];
grades[2] = [3,5,7,9,11];
grades[3] = [4,6,8,10,12];
grades[4] = [5,7,9,11,13];
grades[5] = [6,8,10,12,14];
grades[6] = [7,9,11,13,15];

const modes = [];
modes[0] = [1,1,1,1,0];
modes[1] = [1,1,1,0,1];
modes[2] = [1,1,1,1,1];
modes[3] = [1,0,0,1,1];

exports.modes = modes;

//const chordsRow = [grades[0],grades[2],grades[5],grades[1],grades[3],grades[4],grades[6]];
const chordsRow = [grades[0],grades[1],grades[2],grades[3],grades[4],grades[5],grades[6]];


exports.createChords = () => {
	var chords = [];
	const scale = scales[0];
	const notes = scale.map((e,i) => (e * root) + (e * i)).filter(e => e != 0);
	const offset = 11; //First button value
	const height = 7;
	const width = 7;
	for(var i = 0; i < height; i++ ){
		for(var j = 0; j < width; j++){
			chords[(i * 10) + j + offset] = findInScale(chordsRow[j], scale, notes[i]);
		}
	}
	return chords;
};

exports.filterByMode = (index,mode) => {
	return modes[mode][index];
};

const findInScale = (chord,scale,root) => {
	scale = scale.concat(scale); //Duplicate scale
	const notes = scale.map((e,i) => (e * root) + (e * i)).filter(e => e != 0);
	return openChord(chord.map(e => notes[e - 1]));
};

const openChord = (chord) => {
	return {chord:chord, inversion: chord.map(randomTransponse), mode: 0};
};

const randomTransponse = (note) => {
	var rand = utils.random(100);
	if(rand < 33){
		return note + 12;
	}
	else if(rand > 33 && rand < 66){
		return note - 12;
	}else{
		return note;
	}
};

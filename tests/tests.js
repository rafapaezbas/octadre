const test = require('tape')
const utils = require('../src/utils');

test("Array substraction should work with boolean values when false - true", async (t) => {
	var result = utils.substractArray([false,false,false],[true,true,true]);
	t.deepEqual(result,[-1,-1,-1]);
});

test("Array substraction should work with boolean values when true - false", async (t) => {
	var result = utils.substractArray([true,true,true],[false,false,false]);
	t.deepEqual(result,[1,1,1]);
});

test("Array substraction should work with boolean values values are equal", async (t) => {
	var result = utils.substractArray([true,false,true],[true,false,true]);
	t.deepEqual(result,[0,0,0]);
});

test( "Configuration should get String element by key", async (t) => {
	var configuration = utils.config('./src/config/config.conf');
	t.equal(configuration.getString('TEST_MIDI_INPUT'),'Midi Through:Midi Through Port-0 14:0');
});

test( "Configuration should get number element by key", async (t) => {
	var configuration = utils.config('./src/config/config.conf');
	t.equal(configuration.getInt('COLOR_TRACK_1') + 1, 30);
});

test( "Configuration should get array by key", async (t) => {
	var configuration = utils.config('./src/config/config.conf');
	t.equal(configuration.getArray('BIG_GRID')[0], "14");
	t.equal(configuration.getArray('BIG_GRID')[1], "23");
});

test( "Configuration should ignore comments", async (t) => {
	var configuration = utils.config('./src/config/config.conf');
	t.equal(configuration.getString('comment'), undefined);
});

test( "Configuration should get default number", async (t) => {
	var configuration = utils.config('./src/config/config.conf');
	t.equal(configuration.getIntOrDefault('non-existing-key', 22) + 1, 23);
});

test( "Shift right should work", async (t) => {
	var result = utils.shiftPatternRight([1,2,3,4,5,6]);
	t.deepEqual(result,[6,1,2,3,4,5]);
});

test( "Shift left should work", async (t) => {
	var result = utils.shiftPatternLeft([1,2,3,4,5,6]);
	t.deepEqual(result,[2,3,4,5,6,1]);
});

test("Random pattern must have patternLength number of characters.", async (t) => {
	var result = utils.createRandomPattern(16);
	t.equal(result.length,16);
});

test("Random pattern must have patternLength number of characters.", async (t) => {
	var result = utils.createRandomPattern(6);
	t.equal(result.length,6);
});

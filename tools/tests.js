const utils = require('../src/utils');
const tests = [];

const run = () => {
	var failedTests = tests.filter(t => !t.test());
	failedTests.length == 0 ? console.log("Success") : printFailedTests(failedTests);

}

const addTest = (test,message) => {
	tests.push({test:test,message:message});

}

const printFailedTests = (failedTests) => {
	prettyPrint("Some test/s failed, please check: ");
	failedTests.map(t => prettyPrint(t.message));
}

const prettyPrint = (message) => {
	console.log('\x1b[42m%s\x1b[0m',message);
}

addTest(() => {
	var result = utils.substractArray([false,false,false],[true,true,true]);
	return JSON.stringify(result) == "[-1,-1,-1]";
},"Array substraction should work with boolean values when false - true");

addTest(() => {
	var result = utils.substractArray([true,true,true],[false,false,false]);
	return JSON.stringify(result) == "[1,1,1]";
},"Array substraction should work with boolean values when true - false");

addTest(() => {
	var result = utils.substractArray([true,false,true],[true,false,true]);
	return JSON.stringify(result) == "[0,0,0]";
},"Array substraction should work with boolean values values are equal");

addTest(() => {
	var configuration = utils.config('config.conf');
	return configuration.getString('key1') == 'value1';
}, "Configuration should get String element by key");

addTest(() => {
	var configuration = utils.config('config.conf');
	return configuration.getInt('number') + 1 == 2;
}, "Configuration should get number element by key");

addTest(() => {
	var configuration = utils.config('config.conf');
	return configuration.getArray('array1')[0] == 1 && configuration.getArray('array1')[1] == 2;
}, "Configuration should get array by key");

addTest(() => {
	var configuration = utils.config('config.conf');
	return configuration.getString('comment') == undefined;
}, "Configuration should ignore comments");

addTest(() => {
	var configuration = utils.config('config.conf');
	return configuration.getIntOrDefault('non-existing-key', 22) + 1 == 23;
}, "Configuration should get default number");

addTest(() => {
	var result = utils.shiftPatternRight([1,2,3,4,5,6]);
	return JSON.stringify(result) == "[6,1,2,3,4,5]";
}, "Shift right should work");

addTest(() => {
	var result = utils.shiftPatternLeft([1,2,3,4,5,6]);
	return JSON.stringify(result) == "[2,3,4,5,6,1]";
}, "Shift left should work");

addTest(() => {
	var result = utils.createRandomPattern(16);
	console.log(result);
	return result.length == 16;
}, "Random pattern must have patternLength number of characters.");

addTest(() => {
	var result = utils.createRandomPattern(6);
	console.log(result);
	return result.length == 6;
}, "Random pattern must have patternLength number of characters.");

run();

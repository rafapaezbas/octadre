const utils = require('./utils');
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

run();

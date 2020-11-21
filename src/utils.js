exports.getLaunchpadPort = (ports) => {
	for(var i = 0; i < ports.length; i++){
		if(ports[i].indexOf("Launchpad") != -1){
			return i;
		}
	}
	console.log("No MK2:Launchpad midi i/o found");
}

exports.getNormalPort = (ports) => {
	for(var i = 0; i < ports.length; i++){
		if(ports[i].indexOf("Launchpad") == -1 && ports[i].indexOf("Microsoft") == -1){
			console.log("Output midi port: " + ports[i]);
			return ports[i];
		}
	}
	console.log("No midi i/o found");
}

exports.substractArray = (a,b) => {
	return a.map((e,i) => e - b[i]);
}

exports.isInt = (n) => {
	return Number(n) === n && n % 1 === 0;
}

exports.config = (path) => {
	var config = initConfig(path);
	return {
		getString : (key) => config[key],
		getInt : (key) => parseInt(config[key]),
		getArray : (key) => config[key].split(','),
		getIntOrDefault : (key,defaultValue) => isNaN(parseInt(config[key])) ? defaultValue : parseInt(config[key]),
	}
}

var initConfig = (path) => {
	var file = require('fs').readFileSync(path, 'utf-8').split(/\r?\n/);
	file.pop();  //Remove last item because is always undefined (last line break)
	var config = [];
	file.map(line => {
		if(line[0] != '#' && line.length > 0){ // This means line is a comment or blank
			var key = line.split("=")[0].trim();
			var value = line.split("=")[1].trim();
			config[key] = value;
		}
	});
	return config;
}

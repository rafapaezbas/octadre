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
		if(ports[i].indexOf("Launchpad") == -1){
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




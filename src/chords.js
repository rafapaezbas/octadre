exports.createChords = () => {
    var chords = [];
    for(var i = 0; i < 100; i++){
        chords[i] = [];
        var numOfNotes = Math.floor(Math.random() * 5) + 1;
        for(var j = 0; j < numOfNotes; j++){
            chords[i][j] = Math.floor(Math.random() * 22) + 40;
        }
    }
    return chords;
}

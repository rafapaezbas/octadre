const root = 60;

const scales = [];
scales[0] = [1,0,1,0,1,1,0,1,0,1,0,1]; // Major scale
scales[1] = [1,0,1,1,0,1,0,1,1,0,1,0]; // Minor scale
scales[2] = [1,0,0,1,0,1,1,1,0,0,1,0]; // Blues scale

const grades = [];
grades[0] = [1,3,5,7];
grades[1] = [2,4,6,1];
grades[2] = [3,5,7,2];
grades[3] = [4,6,1,3];
grades[4] = [5,7,2,4];
grades[5] = [6,1,3,5];
grades[6] = [7,2,4,6];

exports.createChords = () => {
    var chords = [];
    for(var i = 0; i < 100; i++){
        chords[i] = [];
        var numOfNotes = Math.floor(Math.random() * 5) + 1;
        for(var j = 0; j < numOfNotes; j++){
            chords[i][j] = Math.floor(Math.random() * 22) + 40;
        }
    }
    chords = changeChords(chords);
    return chords;
}


const changeChords = (chords) => {
    for(var i = 0; i < 7; i++){
        chords[11 + i] = findInScale(grades[i], scales[1], root);
    }
    return chords;
};

const findInScale = (chord,scale,root) => {
    scale = scale.concat(scale); //Duplicate scale
    const notes = scale.map((e,i) => (e * root) + (e * i)).filter(e => e != 0);
    return openChord(chord.map(e => notes[e - 1]));
};

const openChord = (chord) => {
    //chord.push(chord[0] - 12);
    //chord.push(chord[chord.length - 1] - 12);
    return chord.map(randomTransponse);
};

const randomTransponse = (note) => {
    if(Math.random() > 0.5){
        return note + 7;
    }else{
        return note;
    }
};

//var socket = io.connect('http://localhost'); // connect to server
const socket = io();

socket.on("connect", () => {
    //socket.emit('getPubs', { });
});
socket.on("pubs", (pubs) => {
    console.log(pubs);
})

const PADDING = 10;
const TITLE_HEIGHT = 50;

class Lab {
    constructor(name, color) {
        this.name = name;
        this.color = color;
        this.isEnabled = true;
    }
}

let IDMIL = new Lab("Digital Instruments", "#19CC80");
let DDMAL = new Lab("Music Information Retrieval", "#8019CC");
let CAML = new Lab("Acoustic Modeling", "#CC8019");
let SPCL = new Lab("Sound Processing", "#4157D8");
let MPCL = new Lab("Music Perception", "#CC1965");
let labs = [IDMIL, DDMAL, CAML, SPCL, MPCL];


function setup() {
    createCanvas(windowWidth, windowHeight);


    for (let i = 0; i < labs.length; i++) {
        labs[i].button = createButton(labs[i].name);
    }
    IDMIL.button.mouseClicked(function() { labClicked(IDMIL); });
    DDMAL.button.mouseClicked(function() { labClicked(DDMAL); });
    CAML.button.mouseClicked(function() { labClicked(CAML); });
    SPCL.button.mouseClicked(function() { labClicked(SPCL); });
    MPCL.button.mouseClicked(function() { labClicked(MPCL); });
}

function draw() {
    background(0);

    let x = PADDING;
    let y = PADDING;

    // Title
    textSize(38);
    textAlign(CENTER);
    fill(255);
    text('Welcome to MusicTechNet!', x, y + PADDING, windowWidth * .33 - PADDING, TITLE_HEIGHT);

    x += windowWidth * .33;

    // Filter bg
    fill(200);
    let filterWidth = windowWidth * .667 - 2 * PADDING;
    rect(x, y, windowWidth * .667 - 2 * PADDING, TITLE_HEIGHT, PADDING);

    // Filter buttons
    for (let i = 0; i < labs.length; i++) {
        labs[i].button.size(0.98 * filterWidth / labs.length, TITLE_HEIGHT - 1);
        labs[i].button.position(x, y);
        if (labs[i].isEnabled) {
            labs[i].button.style("background-color", labs[i].color);
        } else {
            labs[i].button.style("background-color", "gray");
            labs[i].button.style("border", "2px solid" + labs[i].color);
        }
        x += filterWidth / labs.length + 0.9;
    }

    x = PADDING;
    y += TITLE_HEIGHT + PADDING;

    // Lists
    fill(150);
    rect(x, y, windowWidth * .33 - PADDING, windowHeight - TITLE_HEIGHT - 3 * PADDING, PADDING);

    x += windowWidth * .33;

    //Visualizations
    fill(100);
    rect(x, y, windowWidth * .667 - 2 * PADDING, windowHeight - TITLE_HEIGHT - 3 * PADDING, PADDING);
    let iFrame = document.getElementById('authorFrame');
    iFrame.width = windowWidth * .667 - 2 * PADDING;
    iFrame.height = windowHeight - TITLE_HEIGHT - 3 * PADDING;
    iFrame.style.top = y + "px";
    iFrame.style.left = x + "px";
}

function labClicked(lab) {
    lab.isEnabled = !lab.isEnabled;
    if (lab.isEnabled) {
        pubRetrieval.getAllPapers();
    }
}
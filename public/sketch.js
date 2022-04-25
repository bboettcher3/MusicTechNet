//var socket = io.connect('http://localhost'); // connect to server
const socket = io();

socket.on("connect", () => {
    socket.emit('getPubs', 30); // On load, get all pubs
});
socket.on("pubs", (pubs) => {
    filteredPublications = pubs;
    makePubButtons();
    redraw();
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
let filteredPublications = []; // List of filtered publications (unsorted)
let publicationButtons = []; // Dynamic list of buttons to open publications
let authorSearch;
let authorSearchValue = "";
const NUM_PUBS_LISTED = 10;
const VOSviewerUrl = "https://app.vosviewer.com/?json=https://drive.google.com/uc?id=";
const TempNetworkUrls = [
    "16Gxfe0GLqVJxw-q3gLRqEbwaxccvX4PK", //0
    "1UaN8exoYSTIzTj4GyFEbBcWgJirAV4hr",
    "1NsWU1wbvdpVNHhHQTobQ1Ej5AsPZpKJc",
    "1bXubw9NMcD-vVRg8YZAPcjIOb2BAMU9p",
    "1I30X8zCbqkAPJzDWuSgHRVZxbJpLl358",
    "1Q8nGRQm0syg6-yQDHyUSInG82pYOeO90", //5
    "1zMiUZty2LNuvL0xlvcUCiL64T4w-yz3B",
    "1ihklAG0vvm12x6uHEMuLAS2tQRxe7D79",
    "1Lav9IlKeRz4yiFPV72Jfb38tqNHG9ybn",
    "1k8iffbuoOZcsmyLoqIhVBh63cDZdd3nC",
    "1W-AQ4M6xdJ1K0veHX5ixKtyG3BY3kPHn", //10
    "1mgaJvggdhlh8ydGSHEsF18QKtML06Pm7",
    "1VBxAjlMHw7fKdj3xynmz6akKAP9KKhqX",
    "1B_S9djiSJREyGrqc3c5Xq0HqzRnGo5A3",
    "1b47AmgB021gkOP5L_MBLCrO1R1TRdJ1V",
    "1xBctkJ0vbtz1BgcBfRnexyspy5RRM5e3", //15
    "149zKhjcQMsKL1D97q7rhu-BOW5tUf70O",
    "1iVnaJFkH7oDhYDnrdKw8iH2Hl5Leexg8",
    "1Q7gs-QgpmFfvRY8JTMaW-WTOVjASWYtn",
    "1_yhL7sJRuiit9u6iA86_I_lG_y-CFumh",
    "1PeVXdZ2EZ1iGgfc_QfLVjbVsA1u_hhGe", //20
    "1m_Mg2U_HKGIQSZxPx7CBdptlCvdNGlZX",
    "1jJbZGd7NuCxWnLuvBTS_z1NDOtpF52Rq",
    "17R7gLDUX5JyK621YvC7j8ite-I0WVa20",
    "1qbJ773FjTFZy-6qzV8e9lkjufjLBCyYm",
    "18oixqted_v6UM4CliiM-aWW0Q7kEvBcs", //25
    "1oKbzAdIgy3g0yyxt_eJnMGIojn-momzc",
    "1VoiF1QfnOkShnLrOyBVRKfhNnnx5KUUQ",
    "1_ppRDOHKHRWoaKRw1B13KKh6dK7-YhRM",
    "1vGWn1wdCu8ic0lMmZ5RZT72PQFc2GPOO",
    "1wS5GluLKSUfmeF2mUOtWKYJdcjgB0Y1N", //30
];

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

    authorSearch = createInput();
    authorSearch.style("placeholder", "search for an author...");
    authorSearch.input(onAuthorSearch);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    redraw();
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
    // Bg rect
    fill(150);
    rect(x, y, windowWidth * .33 - PADDING, windowHeight - TITLE_HEIGHT - 3 * PADDING, PADDING);
    // Author search bar
    y += PADDING / 2;
    fill(0);
    textAlign(LEFT, CENTER);
    textSize(14);
    text("Author Search:", x + 2 * PADDING, y, windowWidth * .33 / 2.0, 20);
    authorSearch.size(windowWidth * .33  / 1.5);
    authorSearch.position(x + windowWidth * .33 / 4.0, y);

    line(x, y + 25, x + windowWidth * .33 - PADDING, y + 25);

    y += 20;

    let pubHeight = (windowHeight - TITLE_HEIGHT - 3 * PADDING) / NUM_PUBS_LISTED;
    textSize(13);
    textAlign(LEFT, CENTER);
    
    let pubX = x + PADDING / 2;
    let curPubY = y + PADDING;
    // Make button for each listed pub
    for (let i = 0; i < NUM_PUBS_LISTED; i++) {
        if (i > filteredPublications.length || curPubY > windowHeight - TITLE_HEIGHT - 3 * PADDING) break;
        // White outline rect
        fill(200);
        rect(pubX, curPubY, windowWidth * .33 - 2 * PADDING, pubHeight, PADDING);
        // Covered by gray rect to just leave border
        fill(150);
        rect(pubX + 3, curPubY + 3, windowWidth * .33 - 2 * PADDING - 6, pubHeight - 6, PADDING);
        // Pub title and info text
        fill(0);
        text(filteredPublications[i].title, pubX + PADDING, curPubY + PADDING, windowWidth * .33 - 3 * PADDING, pubHeight / 3);
        text(filteredPublications[i].author[0].family, pubX + PADDING, curPubY + PADDING + pubHeight / 2, windowWidth * .33 - 3 * PADDING, pubHeight / 3);
        curPubY += pubHeight + PADDING / 2;
    }

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
    var networkIdx = 0;
    for (let i = 0; i < labs.length; i++) {
        if (labs[i].isEnabled) {
          networkIdx |= (1 << i);
        }
    }
    // Update pub list
    socket.emit('getPubs', networkIdx);
    // Decrement to convert to index
    networkIdx--;
    // Change iframe src to update visualization
    let iFrame = document.getElementById('authorFrame');
    iFrame.src = VOSviewerUrl + TempNetworkUrls[networkIdx];
    console.log("network: " + networkIdx + ", URL: " + iFrame.src);
    redraw();
}

function onAuthorSearch() {
  authorSearchValue = this.value();
  makePubButtons();
  redraw();
}

function makePubButtons() {
    if (authorSearchValue == "") {
        // Sort eventually, but not for now

    } else {
        // Sort filtered pubs according to author relevance
        for (let i = 0; i < filteredPublications.length; i++) {
          var authors = [];
          for (let j = 0; j < filteredPublications[i].author.length; j++) {
              authors.push(filteredPublications[i].author[j].given + " " + filteredPublications[i].author[j].family);
          }
          var fields = [filteredPublications[i].title];
          fields = fields.concat(authors);
          var pubSim = stringSimilarity.findBestMatch(authorSearchValue, fields);
        }
    }
}
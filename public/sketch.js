const PADDING = 10;
const TITLE_HEIGHT = 50;

class Lab {
    constructor(name, firstName, lastName, color) {
        this.name = name;
        this.firstName = firstName;
        this.lastName = lastName;
        this.color = color;
        this.isEnabled = true;
    }
}

class PubButton {
  constructor(pub) {
    this.pub = pub;
    var pubString = "<b>" + pub.title[0] + "</b><br>";
    for (let i = 0; i < pub.author.length; i++) {
        pubString += pub.author[i].family;
        if (i < pub.author.length - 1) {
            pubString += ", ";
        }
    }
    pubString +=  " (" + pub.created["date-parts"][0][0] + ")"; // published year
    this.button = createButton(pubString);
    this.button.mousePressed(function() {
        window.open(pub.URL);
    });
  }
}

let IDMIL = new Lab("Digital Instruments", "Marcelo", "Wanderley", "#19CC80");
let DDMAL = new Lab("Music Information Retrieval", "Ichiro", "Fujinaga", "#8019CC");
let CAML = new Lab("Acoustic Modeling", "Gary", "Scavone", "#CC8019");
let SPCL = new Lab("Sound Processing", "Philippe", "Depalle", "#4157D8");
let MPCL = new Lab("Music Perception", "Stephen", "McAdams", "#CC1965");
let labs = [IDMIL, DDMAL, CAML, SPCL, MPCL];
let allPublications; // All publications in JSON form
let filteredPublications = []; // List of filtered publications (unsorted)
let publicationButtons = []; // List of PubButton objects to open publications
let githubLink; // Link element to github repo
let githubLinkImg; // Img element for github link
let searchBar; // Search bar element
let searchValue = "";
let pageLeft, pageRight; // Paging buttons
let curPage = 0;
const NUM_PUBS_LISTED = 8;
const VOSviewerUrl = "https://app.vosviewer.com/?json=https://musictechnet.simssa.ca/network?idx=";

function preload() {
  allPublications = loadJSON("MTPublications.json");
}

function setup() {
    createCanvas(windowWidth, windowHeight);

    for (let i = 0; i < labs.length; i++) {
        labs[i].button = createButton(labs[i].name);
        labs[i].button.style("border", "2px solid" + labs[i].color);
        labs[i].button.style("font-weight", "bold");
    }
    IDMIL.button.mouseClicked(function() { labClicked(IDMIL); });
    DDMAL.button.mouseClicked(function() { labClicked(DDMAL); });
    CAML.button.mouseClicked(function() { labClicked(CAML); });
    SPCL.button.mouseClicked(function() { labClicked(SPCL); });
    MPCL.button.mouseClicked(function() { labClicked(MPCL); });

    // Github link
    githubLink = createA("https://github.com/bboettcher3/MusicTechNet", "","_top");
    githubLinkImg = createImg("GitHub-Mark-Light-32px.png", "Github").parent(githubLink);
    githubLinkImg.size(32, 32);

    searchBar = createInput();
    searchBar.style("placeholder", "search for an author...");
    searchBar.input(onSearch);

    pageLeft = createButton("&#8592;");
    pageLeft.mouseClicked(function() {
        if (curPage > 0) curPage--;
        makePubButtons();
    });
    pageRight = createButton("&#8594;");
    pageRight.mouseClicked(function() {
        var numPages = filteredPublications.length / NUM_PUBS_LISTED;
        if (curPage < numPages - 1) curPage++;
        makePubButtons();
    });

    filteredPublications = getPubs(30);

    makePubButtons();
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
    textSize(34);
    textAlign(CENTER, CENTER);
    fill(255);
    text('Music Technology Networks', x, y, windowWidth * .33 - PADDING - githubLinkImg.width, TITLE_HEIGHT);

    x += windowWidth * .33;

    // Github link
    githubLinkImg.position(x - githubLinkImg.width - PADDING, y + PADDING);

    // Filter bg
    let filterWidth = windowWidth * .667 - 2 * PADDING;

    // Filter buttons
    for (let i = 0; i < labs.length; i++) {
        labs[i].button.size(0.98 * filterWidth / labs.length, TITLE_HEIGHT - 1);
        labs[i].button.position(x, y);
        if (labs[i].isEnabled) {
            labs[i].button.style("background-color", labs[i].color);
            labs[i].button.style("font-weight", "bold");
        } else {
            labs[i].button.style("background-color", "gray");
            labs[i].button.style("font-weight", "normal");
        }
        x += filterWidth / labs.length + 0.9;
    }

    x = PADDING;
    y += TITLE_HEIGHT + PADDING;

    // Lists
    // Bg rect
    fill(150);
    rect(x, y, windowWidth * .33 - PADDING, windowHeight - TITLE_HEIGHT - 3 * PADDING);
    // Search bar
    y += PADDING / 2;
    fill(0);
    textAlign(LEFT, CENTER);
    textSize(14);
    text("Search:", x + 2 * PADDING, y, windowWidth * .33 / 2.0, 20);
    searchBar.size(windowWidth * .33 / 1.5);
    searchBar.position(x + windowWidth * .33 / 4.0, y);

    line(x, y + 25, x + windowWidth * .33 - PADDING, y + 25);

    y += 20;

    // Make button for each listed pub
    let pubHeight = (windowHeight - y - 3 * PADDING) / NUM_PUBS_LISTED;
    textSize(13);
    textAlign(LEFT, CENTER);
    let curPubY = y + PADDING;
    noStroke();
    for (let i = 0; i < publicationButtons.length; i++) {
        if (curPubY > windowHeight - TITLE_HEIGHT - 3 * PADDING) break;
        // Pub lab colors
        var pubLabs = getPubLabs(publicationButtons[i].pub);
        var colorHeight = pubHeight / pubLabs.length;
        var curColorY = curPubY;
        for (let j = 0; j < pubLabs.length; j++) {
            fill(pubLabs[j].color);
            rect(x + windowWidth * .33 - 2 * PADDING, curColorY, PADDING, colorHeight);
            curColorY += colorHeight;
        }
        // Pub button
        publicationButtons[i].button.size(windowWidth * .33 - 2 * PADDING - 1, pubHeight);
        publicationButtons[i].button.position(x, curPubY);
        curPubY += pubHeight + PADDING / 2;
    }

    // Paging buttons
    let pagingCenter = x + (windowWidth * .33 - 2 * PADDING) / 2.0;
    let pageY = windowHeight - 5 * PADDING;
    pageLeft.size(50, 30);
    pageRight.size(50, 30);
    pageLeft.position(pagingCenter - 100, pageY);
    pageRight.position(pagingCenter + 50, pageY);
    textAlign(CENTER, CENTER);
    textSize(14);
    fill(0);
    let numPages = Math.floor(filteredPublications.length / NUM_PUBS_LISTED);
    text("page " + (curPage + 1) + "/" + numPages, pagingCenter - 40, pageY, 80, 30);

    x += windowWidth * .33;

    //Visualizations
    let vizY = y - 20 - PADDING / 2;
    let iFrame = document.getElementById('authorFrame');
    iFrame.width = windowWidth * .667 - 2 * PADDING;
    iFrame.height = windowHeight - TITLE_HEIGHT - 3 * PADDING;
    iFrame.style.top = vizY + "px";
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
    if (networkIdx == 0) return;
    curPage = 0;
    // Update pub list
    filteredPublications = getPubs(networkIdx);
    makePubButtons();
    // Decrement to convert to index
    networkIdx--;
    // Change iframe src to update visualization
    let iFrame = document.getElementById('authorFrame');
    iFrame.src = VOSviewerUrl + networkIdx;
    console.log("network: " + networkIdx + ", URL: " + iFrame.src);
    redraw();
}

function onSearch() {
    curPage = 0;
    searchValue = this.value();
    makePubButtons();
}

function makePubButtons() {
    while (publicationButtons.length) {
        publicationButtons[publicationButtons.length - 1].button.remove();
        publicationButtons.pop();
    }
    var startIdx = curPage * NUM_PUBS_LISTED;
    if (searchValue == "") {
        // Sort by number of labs (~interdisciplinararity~)
        for (let i = 0; i < filteredPublications.length; i++) {
            filteredPublications[i].numLabs = getPubLabs(filteredPublications[i]).length;
        }
        filteredPublications.sort((a, b) => (a.numLabs < b.numLabs) ? 1 : -1);
        // Make buttons for the top NUM_PUBS_LISTED pubs
        for (let i = startIdx; i < startIdx + NUM_PUBS_LISTED; i++) {
            if (filteredPublications.length < i) break;
            publicationButtons.push(new PubButton(filteredPublications[i]));
        }
    } else {
        var pubRatings = [];
        // Sort filtered pubs according to author relevance
        for (let i = 0; i < filteredPublications.length; i++) {
            var fields = [];
            for (let j = 0; j < filteredPublications[i].author.length; j++) {
                fields.push(filteredPublications[i].author[j].given.toLowerCase() + " " + filteredPublications[i].author[j].family.toLowerCase());
            }
            fields.push(filteredPublications[i].title[0].toLowerCase());
            var pubSim = stringSimilarity.findBestMatch(searchValue.toLowerCase(), fields);
            pubRatings.push({ "pubIdx": i, "rating": pubSim.bestMatch.rating });
        }
        pubRatings.sort((a, b) => (a.rating < b.rating) ? 1 : -1);

        for (let i = startIdx; i < startIdx + NUM_PUBS_LISTED; i++) {
            var pubIdx = pubRatings[i].pubIdx;
            if (filteredPublications.length < pubIdx) break;
            publicationButtons.push(new PubButton(filteredPublications[pubIdx]));
        }
    }
    redraw();
}

function getPubLabs(pub) {
    var pubLabs = [];
    for (let i = 0; i < labs.length; i++) {
        for (let j = 0; j < pub.author.length; j++) {
            if (pub.author[j].given == labs[i].firstName &&
                pub.author[j].family == labs[i].lastName) {
                // Found author, add to labs list
                pubLabs.push(labs[i]);
            }
        }
    }
    return pubLabs;
}

function getPubs(networkIdx) {
    // Make list of lab heads that are present in network
    let relevantAuthorIds = [];
    for (let i = 0; i < labs.length; i++) {
        if ((networkIdx & (1 << i)) != 0) {
            relevantAuthorIds.push(allPublications.labHeadIds[i]);
        }
    }    

    // Filter publications using networkIdx bits
    var filteredPubs = [];
    for (let i = 0; i < allPublications.publications.length; i++) {
        let isPresent = false; // If pub is present in current filtered list
        for (let j = 0; j < relevantAuthorIds.length; j++) {
            for (let k = 0; k < allPublications.publications[i].mtIDs.length; k++) {
                if (relevantAuthorIds[j] == allPublications.publications[i].mtIDs[k]) {
                    isPresent = true;
                    break;
                }
            }
            if (isPresent) break;
        }
        if (isPresent) {
            // Add pub to filtered list
            filteredPubs.push(allPublications.publications[i]);
        }
    }
    return filteredPubs;
}
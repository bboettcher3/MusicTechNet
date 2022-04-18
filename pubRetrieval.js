const axios = require('axios');
const fs = require('fs');

class Lab {
    constructor(name, firstName, lastName, query) {
        this.name = name;
        this.firstName = firstName;
        this.lastName = lastName;
        this.query = query;
    }
}

class Author {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.links = [];
    }
}

// Formatted according to VOSviewer "item" JSON
class Item {
    constructor(id, label) {
        this.id = id;
        this.label = label;
    }
}

// Formatted according to VOSviewer "link" JSON
class Link {
    constructor(source_id, target_id) {
        this.source_id = source_id;
        this.target_id = target_id;
        this.strength = 1;
    }
}

let VOSNetwork = {
    "network": {
        "items": [],
        "links": []
    }
};

let IDMIL = new Lab("Digital Instruments", "Marcelo", "Wanderley", "query.author=marcelo&query.author=wanderley");
let DDMAL = new Lab("Music Information Retrieval", "Ichiro", "Fujinaga", "query.author=ichiro&query.author=fujinaga");
let CAML = new Lab("Acoustic Modeling", "Gary", "Scavone", "query.author=gary&query.author=scavone");
let SPCL = new Lab("Sound Processing", "Philippe", "Depalle", "query.author=philippe&query.author=depalle");
let MPCL = new Lab("Music Perception", "Stephen", "McAdams", "query.author=stephen&query.author=mcadams");
let labs = [IDMIL, DDMAL, CAML, SPCL, MPCL];

const baseQuery = "https://api.crossref.org/works?";
const cursorSuffix = "&cursor=";
const MAX_FOUND = 100;
const MAX_CURSORS = 10;

let authorList = []; // Array of Author objects
let publications = []; // Array of pub items from Crossref

async function getAllPapers() {
    publications = [];
    authorList = [];
    VOSNetwork = {
        "network": {
            "items": [],
            "links": []
        }
    };
    for (let i = 0; i < labs.length; i++) {
        var numFound = 0;
        var numCursors = 0;
        var cursor = "*";
        var labPubs = [];
        while (numFound < MAX_FOUND && numCursors < MAX_CURSORS) {
            try {
                let res = await axios({
                    url: baseQuery + labs[i].query + cursorSuffix + cursor,
                    method: 'get',
                    timeout: 8000,
                    headers: {
                        'Content-Type': 'application/json',
                    }
                })
                if (res.status != 200) {
                    // test for status you want, etc
                    console.log(res.status);
                }
                // Update cursor
                cursor = res.data.message["next-cursor"];

                var newItems = res.data.message.items;
                newItems = cleanData(newItems);

                publications = publications.concat(newItems);
            } catch (err) {
                console.error(err);
            }
            numCursors++;
            numFound = labPubs.length;
        }
        console.log(i + ": " + authorList.length + " authors and " + publications.length + " pubs");
    }
    VOSNetwork.network.items = createItemJson();
    VOSNetwork.network.links = createLinkJson();
    let data = JSON.stringify(VOSNetwork);
    fs.writeFileSync("MTNetwork.json", data);
    console.log("Papers written!");
    return publications;
}

// Checks for lab head names and corrects any inconsistencies
function cleanData(items) {
    var matchedData = [];
    // Per publication
    for (let i = 0; i < items.length; i++) {
        var matched = checkAddAuthors(items[i].author);
        if (matched) { 
            matchedData.push(items[i]);
        }
    }
    return matchedData;
}

function checkAddAuthors(authors) {
    var matched = false;
    // Check if lab heads are in author list
    for (let i = 0; i < authors.length; i++) {
        for (let j = 0; j < labs.length; j++) {
            if (authors[i].given.includes(labs[j].firstName) &&
                authors[i].family.includes(labs[j].lastName)) {
                authors[i].given = labs[j].firstName;
                authors[i].family = labs[j].lastName;
                matched = true;
            }
        }
    }
    if (matched) {
        // Add new authors to network list
        var authorIds = [];
        for (let i = 0; i < authors.length; i++) {
            var fullName = authors[i].family + ", " + authors[i].given;
            var authorExists = false;
            for (let j = 0; j < authorList.length; j++) {
                // Check if author already exists
                if (fullName == authorList[j].name) {
                    authorExists = true;
                    authorIds.push(authorList[j].id);
                    break;
                }
            }
            if (!authorExists) {
                var newAuthor = new Author(authorList.length, fullName);
                authorList.push(newAuthor);
                authorIds.push(newAuthor.id);
            }
        }
        // Sort author ids ascending
        authorIds.sort(function(a, b) {
            return a - b;
        });
        // Add links to authors from pub
        for (let i = 0; i < authorIds.length; i++) {
            var authorId = authorIds[i];
            for (let j = i + 1; j < authorIds.length; j++) {
                // Check if link exists already
                var hasLink = false;
                for (let k = 0; k < authorList[authorId].links.length; k++) {
                    if (authorList[authorId].links[k].target_id == authorIds[j]) {
                        hasLink = true;
                        authorList[authorId].links[k].strength++;
                        break;
                    }
                }
                if (!hasLink) {
                    var newLink = new Link(authorId, authorIds[j]);
                    authorList[authorId].links.push(newLink);
                }
            }
        }
    }
    return matched;
}

function createItemJson() {
    var itemList = [];
    for (let i = 0; i < authorList.length; i++) {
        // Push, adding 1 to id for VOS network
        itemList.push(new Item(authorList[i].id + 1, authorList[i].name));
    }
    return itemList;
}

function createLinkJson() {
    var linkList = [];
    for (let i = 0; i < authorList.length; i++) {
        for (let j = 0; j < authorList[i].links.length; j++) {
            authorList[i].links[j].source_id++; // Min of 1 for VOS network
            authorList[i].links[j].target_id++;
            linkList.push(authorList[i].links[j]);
        }
    }
    return linkList;
}

module.exports = {
    getAllPapers
}
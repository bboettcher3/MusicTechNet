const axios = require('axios');
const fs = require('fs');

class Lab {
    constructor(name, firstName, lastName, query, color) {
        this.name = name;
        this.firstName = firstName;
        this.lastName = lastName;
        this.query = query;
        this.color = color;
    }
}

class Author {
    constructor(id, name, cluster) {
        this.id = id;
        this.name = name;
        this.cluster = cluster;
        this.links = [];
    }
}

// Formatted according to VOSviewer "item" JSON
class Item {
    constructor(id, label, cluster) {
        this.id = id;
        this.label = label;
        this.cluster = cluster;
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

let IDMIL = new Lab("Digital Instruments", "Marcelo", "Wanderley", "query.author=marcelo&query.author=wanderley");
let DDMAL = new Lab("Music Information Retrieval", "Ichiro", "Fujinaga", "query.author=ichiro&query.author=fujinaga");
let CAML = new Lab("Acoustic Modeling", "Gary", "Scavone", "query.author=gary&query.author=scavone");
let SPCL = new Lab("Sound Processing", "Philippe", "Depalle", "query.author=philippe&query.author=depalle");
let MPCL = new Lab("Music Perception", "Stephen", "McAdams", "query.author=stephen&query.author=mcadams");
let labs = [IDMIL, DDMAL, CAML, SPCL, MPCL];

const baseQuery = "https://api.crossref.org/works?";
const cursorSuffix = "&mailto=bradyboettcher@gmail.com&cursor=";
const MAX_FOUND = 100;
const MAX_CURSORS = 10;

let authorList = []; // Array of Author objects
let labHeadIds = []; // Array of lab head item ids
let publications = []; // Array of pub items from Crossref
let labCombinationNetworks = []; // Array of networks for the 30 or so lab filter combinations
let VOSNetworkEmpty = {
    "network": {
        "items": [],
        "links": [],
        "clusters": [
            { "cluster": 1, "label": labs[0].name },
            { "cluster": 2, "label": labs[1].name },
            { "cluster": 3, "label": labs[2].name },
            { "cluster": 4, "label": labs[3].name },
            { "cluster": 5, "label": labs[4].name }
        ]
    },
    "config": {
        "color_schemes": {
            "cluster_colors": [
                { "cluster": 1, "color": "#19CC80" },
                { "cluster": 2, "color": "#8019CC" },
                { "cluster": 3, "color": "#CC8019" },
                { "cluster": 4, "color": "#4157D8" },
                { "cluster": 5, "color": "#CC1965" }
            ]
        },
        "parameters": {
            "attraction": 7,
            "repulsion": 1,
            "dark_ui": true
        }
    }
};

function getPubs(networkIdx) {
    // Parse pubs json
    fs.writeFileSync("./MTPublications.json", pubData);

}

async function getAllPapers() {
    console.log("Querying CrossRef for publications")
    publications = [];
    authorList = [];
    labHeadIds = new Array(labs.length);

    // Make network skeletons for each combination
    labCombinationNetworks = [];
    for (let i = 1; i < Math.pow(2, labs.length); i++) {
        labCombinationNetworks.push(JSON.parse(JSON.stringify(VOSNetworkEmpty)));
    }
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
                newItems = cleanData(newItems, i);

                publications = publications.concat(newItems);
            } catch (err) {
                console.error(err);
            }
            numCursors++;
            numFound = labPubs.length;
        }
        console.log(i + ": " + authorList.length + " authors and " + publications.length + " pubs");
    }

    // Convert authors and links to VOSviewer objects for each combination
    createVOSJsons();
    for (let i = 0; i < labCombinationNetworks.length; i++) {
        let data = JSON.stringify(labCombinationNetworks[i]);
        fs.writeFileSync("MTNetwork_" + i + ".json", data);
    }
    let pubData = JSON.stringify(publications);
    fs.writeFileSync("MTPublications.json", pubData);
    console.log("Papers written!");
    return publications;
}

// Checks for lab head names and corrects any inconsistencies
function cleanData(items, labIdx) {
    var matchedData = [];
    // Per publication
    for (let i = 0; i < items.length; i++) {
        var authorIds = checkAddAuthors(items[i].author, labIdx);
        if (authorIds.length > 0) {
            items[i].mtIDs = authorIds; // Add array of author IDs to connect to networks
            matchedData.push(items[i]);
        }
    }
    return matchedData;
}

// Returns an array of author IDs if matched, empty if not
function checkAddAuthors(authors, labIdx) {
    var matched = false;
    var cluster = labIdx + 1;
    // Check if lab heads are in author list
    for (let i = 0; i < authors.length; i++) {
        authors[i].isLabHead = false;
        for (let j = 0; j < labs.length; j++) {
            if (authors[i].given.includes(labs[j].firstName) &&
                authors[i].family.includes(labs[j].lastName)) {
                authors[i].given = labs[j].firstName;
                authors[i].family = labs[j].lastName;
                authors[i].isLabHead = true;
                cluster = j + 1;
                matched = true;
            }
        }
    }
    if (!matched) return [];

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
            var newAuthor = new Author(authorList.length + 1, fullName, cluster);
            authorList.push(newAuthor);
            authorIds.push(newAuthor.id);
            if (authors[i].isLabHead) {
                // Find which lab and add to lab head id array
                for (let j = 0; j < labs.length; j++) {
                    if (authors[i].given.includes(labs[j].firstName) &&
                        authors[i].family.includes(labs[j].lastName)) {
                        labHeadIds[j] = newAuthor.id;
                    }
                }
            }
        }
    }
    // Sort author ids ascending
    authorIds.sort(function(a, b) {
        return b - a;
    });
    // Add links to authors from pub
    for (let i = 0; i < authorIds.length; i++) {
        var authorIdx = authorIds[i] - 1;
        for (let j = i + 1; j < authorIds.length; j++) {
            // Check if link exists already
            var hasLink = false;
            for (let k = 0; k < authorList[authorIdx].links.length; k++) {
                if (authorList[authorIdx].links[k].target_id == authorIds[j]) {
                    hasLink = true;
                    authorList[authorIdx].links[k].strength++;
                    break;
                }
            }
            if (!hasLink) {
                var newLink = new Link(authorIds[i], authorIds[j]);
                authorList[authorIdx].links.push(newLink);
            }
        }
    }

    return authorIds;
}

// Holy fucc clean this for loop mess up
function createVOSJsons() {
    // Find author links to labs, add to respective networks
    for (let i = 0; i < authorList.length; i++) {
        var labLinks = []; // Indices of labs the author is connected to in 5 bit binary
        for (let j = 0; j < labHeadIds.length; j++) {
            if (isAuthorLinkedToLab(authorList[i].id, labHeadIds[j])) {
                labLinks.push(j);
            }
        }

        // For each lab link combination, add an author item and matching links to the respective network
        var combos = binaryCombos(labs.length);
        for (let j = 0; j < combos.length; j++) {
            // Skip all labs off combination
            if (j == 0) {
                continue;
            }
            // Check if current network needs this author
            var needsAuthor = false;
            for (let k = 0; k < labLinks.length; k++) {
                if (combos[j][labLinks[k]]) {
                    needsAuthor = true;
                    break;
                }
            }
            if (!needsAuthor) continue;

            // 5 bit binary code representing the active disciplines
            var networkIdx = 0;
            for (let k = 0; k < labs.length; k++) {
                if (combos[j][k]) {
                    networkIdx |= (1 << k);
                }
            }
            networkIdx--; // Convert to index
            // Add author to network
            var newAuthor = new Item(authorList[i].id, authorList[i].name, authorList[i].cluster);
            labCombinationNetworks[networkIdx].network.items.push(newAuthor);
            // Add links that are relevant to this network
            for (let l = 0; l < authorList[i].links.length; l++) {
                // Check if link is connected to any active labs
                for (let m = 0; m < combos[j].length; m++) {
                    // Only add link if lab is active and link target is also linked
                    if (combos[j][m] && isAuthorLinkedToLab(authorList[i].links[l].target_id, labHeadIds[m])) {
                        labCombinationNetworks[networkIdx].network.links.push(authorList[i].links[l]);
                        break;
                    }
                }
            }
        }
    }
}

function binaryCombos(n) {
    var result = [];
    for (y = 0; y < Math.pow(2, n); y++) {
        var combo = [];
        for (x = 0; x < n; x++) {
            //shift bit and and it with 1
            if ((y >> x) & 1)
                combo.push(true);
            else
                combo.push(false);
        }
        result.push(combo);
    }
    return result;
}

// Returns true if author and the lab head are linked in at least 1 publication
function isAuthorLinkedToLab(authorId, labHeadId) {
    if (authorId == labHeadId) {
        return true;
    } else if (authorId < labHeadId) {
        // Check lab head links
        for (let i = 0; i < authorList[labHeadId - 1].links.length; i++) {
            if (authorList[labHeadId - 1].links[i].target_id == authorId) {
                return true;
            }
        }
    } else {
        // Check author links
        for (let i = 0; i < authorList[authorId - 1].links.length; i++) {
            if (authorList[authorId - 1].links[i].target_id == labHeadId) {
                return true;
            }
        }
    }
    return false;
}

module.exports = {
    getAllPapers
}
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

async function getAllPapers() {
    let pubs = { "labPubs": [] };
    for (let i = 0; i < labs.length; i++) {
        var numFound = 0;
        var numCursors = 0;
        var cursor = "*";
        var labPubs = [];
        var response;
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

                labPubs = labPubs.concat(newItems);
                response = res.data;
            } catch (err) {
                console.error(err);
            }
            numCursors++;
            numFound = labPubs.length;
        }
        response.message.items = labPubs;
        let data = JSON.stringify(response);
        fs.writeFileSync(labs[i].name + "_crossref.json", data);
        pubs.labPubs.push(labPubs);
        console.log(labs[i].name + ": found " + numFound + " with " + numCursors + " cursors");
    }
    return pubs;
}

// Checks for lab head names and corrects any inconsistencies
function cleanData(items) {
    var matchedData = [];
    // Per item
    for (let i = 0; i < items.length; i++) {
        var matched = false;
        // Per author
        for (let j = 0; j < items[i].author.length; j++) {
            // Per lab
            for (let k = 0; k < labs.length; k++) {
                if (items[i].author[j].given.includes(labs[k].firstName) &&
                    items[i].author[j].family.includes(labs[k].lastName)) {
                    items[i].author[j].given = labs[k].firstName;
                    items[i].author[j].family = labs[k].lastName;
                    matched = true;
                }
            }
        }
        if (matched) { 
            matchedData.push(items[i]);
        }
    }
    return matchedData;
}

module.exports = {
    getAllPapers
}
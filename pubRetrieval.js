const axios = require('axios');

class Lab {
  constructor(name, query) {
    this.name = name;
    this.query = query;
  }
}

let IDMIL = new Lab("Digital Instruments", "query.author=marcelo&query.author=wanderley");
let DDMAL = new Lab("Music Information Retrieval", "query.author=ichiro&query.author=fujinaga");
let CAML = new Lab("Acoustic Modeling", "query.author=gary&query.author=scavone");
let SPCL = new Lab("Sound Processing", "query.author=philippe&query.author=depalle");
let MPCL = new Lab("Music Perception", "query.author=steven&query.author=mcadams");
let labs = [IDMIL, DDMAL, CAML, SPCL, MPCL];

const baseQuery = "https://api.crossref.org/works?";
const cursorSuffix = "&cursor=";


async function getAllPapers() {
  try {
    let res = await axios({
      url: baseQuery + IDMIL.query + cursorSuffix + "*",
      method: 'get',
      timeout: 8000,
      headers: {
          'Content-Type': 'application/json',
      }
    })
    if(res.status == 200){
      // test for status you want, etc
      console.log(res.status)
    }    
    // Don't forget to return something   
    return res.data.message;
  }
  catch (err) {
    console.error(err);
  }
}

module.exports = {
  getAllPapers
}
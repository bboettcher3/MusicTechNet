const axios = require('axios');

module.exports = {
  function getAllPapers() {
    axios
      .get('https://api.crossref.org/works?query.author=marcelo&query.author=wanderley&cursor=*')
      .then(res => {
        console.log(`statusCode: ${res.status}`);
        console.log(res);
      })
      .catch(error => {
        console.error(error);
      });
  }
}
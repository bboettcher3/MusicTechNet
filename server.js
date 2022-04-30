const express = require('express');
var path = require('path');
const cron = require('node-cron');
const pubRetrieval = require('./pubRetrieval.js');
const fs = require('fs');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.get('/network', function(req, res) {
  const filename = __dirname + "/data/MTNetwork_" + req.query.idx + ".json";
  var file = new File(filename);
  if (file.exists()) {
    let netJson = JSON.parse(fs.readFileSync(filename));
    res.json(netJson); // Set disposition and send it.
  }
});

var port = 8080;
app.set('port', port);
var server = require('http').createServer(app);

// Schedule update pubs task to be run on the server once a day.
cron.schedule('0 0 * * *', function() {
  console.log('Updating pubs');
  pubRetrieval.getAllPapers();
});

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string' ?
        'Pipe ' + port :
        'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string' ?
        'pipe ' + addr :
        'port ' + addr.port;
    //console.log('Listening on ' + bind);
}
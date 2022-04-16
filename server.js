const express = require('express');
var path = require('path');
const pubRetrieval = require('./pubRetrieval.js');

const app = express();

app.use(express.static(path.join(__dirname, 'public')))

var port = 8080;
app.set('port', port);
var server = require('http').createServer(app);

const io = require('socket.io')(server);
io.sockets.on('connection', function (socket) {
  pubRetrieval.getAllPapers().then(res => socket.emit('pubs', res));
  //console.log(pubs);
  //socket.emit('pubs', pubs); // Send pubs to client on connection

  // Get subsets of the pubs if requested
  // data argument should include indices of the labs to get
  socket.on('getPubs', function (data) {  
    console.log("Okay bish damn hold on..");
  });
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

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

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
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  console.log('Listening on ' + bind);
}
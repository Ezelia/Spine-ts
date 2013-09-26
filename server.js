var connect = require('connect');

console.log('Tiny HTTP server : point your browser to http://localhost:8080/');
connect.createServer(
    connect.static(__dirname)
).listen(8080);
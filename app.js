var express = require("express");

var http = require('http');


var path = require('path');

var app = express();

var port = 3000
app.set('port', port);

var server = http.createServer(app);

server.listen(port);


app.use(express.static(path.join(__dirname, 'public')));

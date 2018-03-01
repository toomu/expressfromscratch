var express = require("express");

var http = require('http');


var path = require('path');

var app = express();

var port = 3000
app.set('port', port);

var server = http.createServer(app);

server.listen(port);


app.use(express.static(path.join(__dirname, 'public')));


var router = express.Router();

router.get('/', function(req, res, next) {


  console.log("someone accessing website");
  res.json({"request":"success"});

});


app.use(router)
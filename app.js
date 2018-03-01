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

var router2 = express.Router();

router.get('/', function(req, res, next) {


  console.log("someone accessing website");
  res.json({"request":"success"});

});



router2.get('/url2', function(req, res, next) {


  console.log("someone accessing url2");
  res.json({"request":"url2"});

});


app.use(router)
app.use(router2)
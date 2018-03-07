var express = require("express");
var http = require('http');
var path = require('path');
var expressValidator = require("express-validator");
var flash = require('connect-flash');

var mongoose = require("mongoose");

var app = express();


var session = require("express-session");
const MongoStore = require('connect-mongo')(session);

app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: "supersecret",
  store: new MongoStore({
    url: "mongodb://localhost:27017/test",
    autoReconnect: true,
    clear_interval: 3600
  })
}));

app.use(expressValidator());




var multer = require("multer");
const upload = multer({ dest: path.join(__dirname, 'uploads') });


var favicon = require('serve-favicon');

app.use(favicon(path.join(__dirname, 'public', 'favicon_.ico')));
// app.use('/favicon.ico', express.static('images/favicon.ico'));

var cookieParser = require('cookie-parser')
app.use(cookieParser())

app.use(function(req, res, next) {
  console.log('Cookies: ', req.cookies);
  next();
})


var logger = require('morgan');
app.use(logger('dev'));

mongoose.connect("mongodb://localhost:27017/test");

mongoose.connection.on("error", function(err){
  console.log(err);
  process.exit();

});


var restaurantSchema = new mongoose.Schema({
  name: {type:String, required:true},
  description: {type:String, default:"wtf"},
  phone: String,
  address:String,
  // menu : [],
  // images : []
});


var Restaurant = mongoose.model("Restaurant" , restaurantSchema);



var port = 3000
app.set('port', port);

var server = http.createServer(app);

server.listen(port);



app.use(express.static(path.join(__dirname, 'public')));


app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(function(req, res, next) {
  // console.log(next.toString());
  res.locals.creator = "kamal"
  next();
});


var router = express.Router();

var router2 = express.Router();



router2.post('/restaurants', function(req, res, next) {

  // console.log(req.body);

  var res1 = new Restaurant({
    name: req.body.name
  })


  res1.save(function(err){
    if(err){
      console.log(err);
      res.json({"status":err})
    }else{
      res.json({"status":"success"});
    }


  });

});

router2.get('/restaurants', function(req, res, next) {

  Restaurant.find({}, function(err, restaurants) {

    if(err){
      res.json({err:err});
    }else{
      res.send(restaurants);
    }
  });


});

router2.get('/restaurants/:id', function(req, res, next) {

  Restaurant.findById(req.params.id, function(err, restaurant) {
    if(err){
      res.json({err:err});
    }else{
      res.json(restaurant);
    }
  });


});

router2.delete('/restaurants/:id', function(req, res, next) {


  console.log(req.params);

  Restaurant.remove({ _id: req.params.id}, function(err) {
    if (err) {
      res.json({err:err});
    }
    else {
      res.json({
        status:"success"
      })
    }
  });


});

router2.patch('/restaurants/:id', function(req, res, next) {


  console.log(req.params);

  Restaurant.findByIdAndUpdate(req.params.id, { $set: { name: req.body.name }},{new:true}, function (err, restaurant) {
    if (err){
      res.json({err:err})
    }else{
      res.json({restaurant:restaurant});
    }
  });

});

router2.post('/upload', upload.single('myFile'), function(req,res,next){
  res.json({status:"success"});
});

router2.get('/download/:file', function(req,res,next){
  res.sendFile(__dirname + "/uploads/" + req.params.file);
});




app.use(router)


var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(router2)



app.use(expressValidator());

app.use(function(req,res,next){ //errfunction


  var err = new Error("Not found");
  err.status =404;
  next(err);

});




router2.get('/signup', function(req, res, next) {
    res.render('signupp.html', { title: 'signup' });
});

var userSchema = mongoose.Schema({
    firstName: { type:String,required:true},
    lastName: { type:String,required:true},
    yourEmail: { type:String,required:true},
    yourPassword: { type:String,required:true}


});

var user = mongoose.model('user', userSchema);

router2.post('/signup', function(req, res, next) {

    req.checkBody('firstname','firstname is required').notEmpty;
    req.checkBody('lastname','lastname is required').notEmpty;
    req.checkBody('email','Invalid email address').notEmpty.isEmail();
    req.checkBody('password','password is invalid').isLength({min:6}).equals(req.body.confirmpassword);


    var data = new user({ firstName:req.body.firstname ,lastName:req.body.lastname,yourEmail:req.body.email,yourPassword:req.body.password});
    data.save();
    res.render('signupp.html', { title: 'signup' });

});

app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

app.use(function(err, req,res, next){ //errrenderfucntion

  if(err){

    res.locals.message = err.message;


    
    console.log(err);

    res.render("error", {err:err, common:"common"});
  }

})



// console.log(process)
// process.exit();

//morgan, bodyparser, creator router, router2 , errfunction, errrenderfunction







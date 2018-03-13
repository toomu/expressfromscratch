var express = require("express");
var http = require('http');
var path = require('path');
var expressValidator = require("express-validator");
// var flash = require('connect-flash');

var jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');


////////////////////////////////////////
var mongoose = require("mongoose");

var app = express();
var bodyParser = require('body-parser');


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


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null,path.join(__dirname, 'uploads'))
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now())
        // console.log(req);
        // cb(null, req.body.email + '-' + Date.now())
    }
})

var upload = multer({ storage: storage }).single("myFile");

//////////////////////////////////////////////////////////////

var favicon = require('serve-favicon');

app.use(favicon(path.join(__dirname, 'public', 'favicon_.ico')));
// app.use('/favicon.ico', express.static('images/favicon.ico'));

var cookieParser = require('cookie-parser')
app.use(cookieParser())

app.use(function(req, res, next) {
  console.log('Cookies: ', req.cookies);
  next();
});


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var logger = require('morgan');
app.use(logger('dev'));

mongoose.connect("mongodb://localhost:27017/test");

mongoose.connection.on("error", function(err){
  console.log(err);
  process.exit();

});

var port = 3000
app.set('port', port);

var server = http.createServer(app);

server.listen(port);

app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));


app.use(function(req, res, next) {
    // console.log(next.toString());
    res.locals.creator = "kamal"
    next();
});

var router = express.Router();

var router2 = express.Router();

app.use(router)


app.use(router2)

app.use(expressValidator());

app.use(function(req,res,next){ //errfunction


    var err = new Error("Not found");
    err.status =404;
    next(err);

});


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var restaurantSchema = new mongoose.Schema({
  name: {type:String, required:true},
  state: String,
  address:String,
    landmark:String,
    city:String,
    zipcode:String,
    phonenumber:String
  // menu : [],
  // images : []
});


var Restaurant = mongoose.model("Restaurant" , restaurantSchema);

router2.post('/restaurants', function(req, res, next) {
      // console.log(req.body);
  var res1 = new Restaurant({

      name: req.body.name,
      address: req.body.address,
      state:req.body.state,
      landmark:req.body.landmark,
      city:req.body.city,
      zipCode:req.body.zipCode,
      phoneNumber:req.body.phoneNumber

  })

  res1.save(function(err,data){

    if(err){
      console.log(err);
      res.json({"status":err})
    }else{
        console.log(data)
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

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

router2.post('/upload', function(req,res,next){
  res.json({status:"success"});
});

router2.get('/download/:file', function(req,res,next){
  res.sendFile(__dirname + "/uploads/" + req.params.file);
});

// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var options = {
    auth: {
        // api_user: 'AnanthaVarma',
        // api_key:"test@1234"
        // api_user:"KGOCLQjDSDWKEtYzT7rEKA",
        api_key: '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'
    }
}

// console.log(sgTransport(options))

var client = nodemailer.createTransport(sgTransport(options));

/////////////////////////////////////////////////////////////////////////////////////////////////

var userSchema = mongoose.Schema({
    firstName: { type:String,required:true},
    lastName: { type:String,required:true},
    yourEmail: { type:String,required:true},
    yourPassword: { type:String,required:true},
    profileImage: { type:String},
    // active: {type:Boolean, required:true, default:false},
    temporaryToken: {type:String,required:true}
});

var User = mongoose.model('User', userSchema);

    router2.post('/signup', function(req, res, next) {

    // console.log(req.body)

    upload(req,res,function(err) {
        if(err) {
            return console.log(err)
        }
        // console.log(req);
        req.checkBody('firstName','firstname is required').notEmpty();
        req.checkBody('lastName','lastname is required').notEmpty();
        req.checkBody('email', 'email is required').notEmpty();
        req.checkBody('email', 'Invalid email address').isEmail();
        req.checkBody('password', 'password required').notEmpty();
        req.checkBody('password', 'password is short - min 6 char required').isLength({min: 6});

        var errors = req.validationErrors();

        // console.log(errors);
        if (errors) {
            res.json({"status": errors})
        } else {


            var user = new User({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                yourEmail: req.body.email,
                yourPassword: req.body.password,
                profileImage: req.body.myFail,
                temporaryToken: jwt.sign({email:req.body.email }, "rwwrbwr",{ expiresIn: '24h'})

            });

            user.save(function (err) {
                if (err) {
                    console.log(err);
                    res.json({"status": err})
                } else {

                    var email = {
                        from: req.body.email,
                        to: req.body.email,
                        subject: 'Localhost Activation Link',
                        text: 'Hello' + req.body.firstName + 'Thank You for resigstering at localhost.Please click on link below to complete your activation',
                        html: 'Hello <strong> ' + req.body.firstName + '</strong>' +'<br><br>Thank You for resigstering at localhost.'+
                        'Please click on link below to complete your activation:<br><br><a href="http://localhost:3000/activate/">http://localhost:3000/activate</a>'
                    };

                    client.sendMail(email, function(err, info){
                        if (err ){
                            console.log(err);
                        }
                        else {
                            console.log(arguments);
                        }
                    });

                    res.json({"status": "Account Registered! please check your activation link."})
                }
            });
        }
    });

});

    router2.get('/users', function (req, res, next) {

        User.find({}, function (err, user) {

            if (err) {
                res.json({err: err})
            } else {
                res.send(user);
            }
        });
    });

    router2.get('/users/:id', function (req, res, next) {

        User.findById(req.params.id, function (err, user) {
            if (err) {
                res.json({err: err});
            } else {
                res.json(user);
            }
        });
    });

    router2.delete('/users/:id', function (req, res, next) {

        console.log(req.params);

        User.remove({_id: req.params.id}, function (err) {
            if (err) {
                res.json({err: err});
            }
            else {
                res.json({
                    status: "success"
                })
            }
        });
    });

    router2.patch('/users/:id', function (req, res, next) {


        console.log(req.params, req.body);

        User.findByIdAndUpdate(req.params.id, {
            $set: {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                yourEmail: req.body.email,
                yourPassword: req.body.password
            }
        }, {new: true}, function (err, user) {
            if (err) {
                res.json({err: err})
            } else {
                res.json({user: user})
            }
        });

    });

    //////////////////////////
router2.post('/login', function (req, res, next) {

    User.find({yourEmail:req.body.yourEmail, yourPassword:req.body.yourPassword}, function (err, user) {
        console.log(user);
        if (!(user.length == 1)) {
            res.json({err: "no user"});
        } else {
            res.send("login sucsessfull");
        }
    });
});

//
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    app.use(require('connect-flash')());
    app.use(function (req, res, next) {
        res.locals.messages = require('express-messages')(req, res);
        next();
    });

    app.use(function (err, req, res, next) { //errrenderfucntion

        if (err) {

    res.locals.message = err.message;
    console.log(err);

            res.json({err: err});
        }

    })
// console.log(process)
// process.exit();
//
// morgan, bodyparser, creator router, router2 , er

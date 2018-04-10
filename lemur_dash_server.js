//standard start for server file
var express = require("express");
var app = express();
var port = 8000;

var bodyParser = require('body-parser'); //back end talks to front end
var path = require("path"); 
var session = require("express-session");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "./static")));

app.use(session({secret: 'codingdojorocks'}));

app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

mongoose.connect("mongodb://localhost/lemur_dash");

//***************
//DB creation
var LemurSchema = new Schema({
    name:  { type: String, required: true, minlength: 2},
    age: { type: Number, min: 1, max: 150 },
    sex: { type: String, required: true }
}, {timestamps: true })
mongoose.model('Lemur', LemurSchema); // We are setting this Schema in our Models as 'Lemur'
var Lemur = mongoose.model('Lemur') // We are retrieving this Schema from our Models, named 'Lemur'
//***************





//**********
//Routing goes here
app.get('/', function (req, res) {
    Lemur.find({}, function(err, lemurs){
        if(err){
            console.log("something went wrong");
            res.render('inded',{lemurs: []});
        }
        else{
            console.log('lemurs found');
            res.render('index',{lemurs: lemurs});
        }
    })
});



app.get("/lemurs/new", function(req, res){
    res.render("newlemur",{});
})

app.post("/lemurs", function(req, res){
    console.log("post data", req.body);
    var lemur = new Lemur({
        name: req.body.name,
        age: req.body.age,
        sex: req.body.sex
    });
    lemur.save(function(err){
        if(err){
            console.log("something went wrong");            
        }
        else{
            console.log("lemur added");
        }
        res.redirect("/");
    });
});

app.get("/lemurs/:id", function(req, res){
    Lemur.find({_id: req.params.id},function(err, lemur){
        if(err){
            console.log("something went wrong");
            res.redirect("/");
        }
        else{
            console.log('lemur found by id');
            res.render('index',{lemurs: lemur});
        }
    })
})

app.get("/lemurs/edit/:id",function(req,res){
    Lemur.find({_id: req.params.id},function(err, lemur){
        console.log(lemur)
        var context = {
            name : lemur[0].name,
            id : lemur[0]._id
        }   
        if(err){
            console.log("something went wrong");
            res.redirect("/");
        }
        else{
            res.render('edit',context);
        }
    })
})

app.post("/lemurs/:id", function(req, res){
    console.log('found update route');
    var conditions = {_id: req.params.id};
    var update = {
        name: req.body.name,
        age: req.body.age,
        sex: req.body.sex
    }
    Lemur.findOneAndUpdate(conditions, {$set: update},{upsert: false}, function(err, lemur){
        console.log(lemur)
        if(err){
            console.log("something went wrong");
        }
        else{
            console.log("lemur updated");
            
        }
        res.redirect("/");        
    })
})

app.post("/lemurs/destroy/:id", function(req,res){
    console.log('found destroy route');
    Lemur.findByIdAndRemove(req.params.id, function(err, outcome){
        if(err){
            console.log("something went wrong with destroy");
        }
        else{
            console.log("lemur murdered");
            console.log(outcome);
        }
        res.redirect("/");        
    });
});

//**********

app.listen(port, function() {
    console.log("listening on port "+port);
   });

//require('dotenv').config();
const express = require('express');
const app = express();
Port = process.env.PORT || 3000;
app.listen(Port,()=>console.log(`App is runnign on Port No.: ${Port}`));
const session = require('express-session');
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use('/icons',express.static(__dirname+'/public'));
app.use(session({
	secret: process.env.SECRET_KEY,
	resave: true,
	saveUninitialized:true
}));
app.set('view engine','ejs');
app.set('views','./public');
const CryptoJS = require('crypto-js');
let keys;
const MongoClient = require('mongodb').MongoClient;

function checkSession(req,res,next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

app.get('/login',(req,res)=>{
    res.render('login');
});

app.post('/login',(req,res)=>{
    req.session.user = req.body.username;
    keys = req.session.user;
    res.redirect('/');
});

app.get('/',checkSession,(req,res)=>{
    res.render('index',{key:keys});
});

app.get('/fetchData',(req,res)=>{
    MongoClient.connect(process.env.DB_URL,{ useUnifiedTopology: true }, function(err, client) {
        const db = client.db('mydata');
        const collection = db.collection('accounts');
        collection.find({}).toArray(function(err, docs) {
        if (err) throw err;
        res.json(docs);
        client.close();
        });
    });
});

app.get('/logout',(req,res)=>{
    req.session.destroy (function(){
        //console.log('User logged out');
    });
    res.redirect('/login');
});

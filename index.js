// 1. Setup

// Express
const express = require('express');
const app = express();

// Handlebars
const hbs = require('hbs');
app.set('view engine', 'hbs');

// Wax-On
const waxOn = require ('wax-on');
waxOn.on(hbs.handlebars);
waxOn.setLayoutPath('./views/layouts')

// read in env
require('dotenv').config()
// console.log(process.env.MONGO_URI)

// Static folder
app.use(express.static('public'));

// Enable forms
app.use(express.urlencoded({extended:false}));

// Axios
const axios = require ('axios');

// Mongo
const {
    connect,
    getDB
} = require('./MongoUtil');


// 2. Routes
// app.get('/', function(req,res){
//     res.send("Hello world");
// })

async function main(){

    await connect(process.env.MONGO_URI, "diy_home_decor")

    app.get('/', async function (req, res) {
        const data = await getDB().collection('projects')
            .find({})
            .toArray(); // find all documents

        res.send(data);
    })

}
main();

// 3. Listen
app.listen(3000, function(){
    console.log("server has started");
})
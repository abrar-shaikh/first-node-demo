var express = require('express')
var config = require('./config')
var bodyParser = require('body-parser')
var actions = require('./Actions.js')
var mongoose = require('mongoose')
var app = express()

app.use(bodyParser.json());

mongoose.connect(config.dburl, { useNewUrlParser: true })

app.post('/registerUser', (req, res) => actions.registerUser(req, res))

app.post('/login',(req,res) => actions.login(req,res))

app.get('/getUser/:id', (req, res) => actions.getUser(req, res))

app.patch('/updateUser/:id', (req, res) => actions.updateUser(req, res))

app.post('/registerClass',(req,res)=>actions.registerClass(req,res))

app.get('/buyClass/:userId/:classId',(req,res)=>actions.buyClass(req,res))

// app.get('/showData/:userId/:classId',(req,res)=>actions.buyClass(req,res))

app.listen(config.port, () => {
	console.log(`server running on ${config.port}`);
});

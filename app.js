var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    methodOverride = require("method-override");
var mongoose = require('mongoose');
var cors = require('cors')
var multer = require('multer');
var upload = multer();
var BBDDService = require("./services/BBDDService");
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true })); 
//form-urlencoded

// for parsing multipart/form-data
app.use(upload.any()); 
app.use(express.static('public'));
app.use(methodOverride());

var router = express.Router();
app.use(cors());
app.use(router);

mongoose.connect('mongodb://localhost/presupuestos_personales', function(err, res) {
  if(err) {
    console.log('ERROR: connecting to Database. ' + err);
  }

  
          
  // Rutas
    var indexRouter = require('./routes');
app.use('/', indexRouter);

  app.listen(3000, function() {
    console.log("Node server running on http://localhost:3000");
    let insercion = BBDDService.insertarDivisas();
 });
});
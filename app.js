
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

var server = http.createServer(app);
server.listen(app.get('port'), function() {
  console.log("Express server listening on port " + app.get('port'));
});

// mongoose... should be in model.js
var mongoose = require('mongoose');
var mongoOptions = {
  db: { safe: true },
  server: { auto_reconnect: true},
  replset: { read_secondary: true}
};

var uri = 'mongodb://localhost/rgv';
var db = mongoose.connect (uri, mongoOptions, function (err, res) {
  if (err)
    console.log ('ERROR connecting to: ' + uri + '. ' + err);
  else
    console.log ('Succeeded connected to: ' + uri);
});

var rgvSchema = new mongoose.Schema ({
    _id   : String,
    date  : Date,
    type  : String,
    cmd   : String,
    name  : mongoose.Schema.Types.Mixed,
    source: mongoose.Schema.Types.Mixed,
    target: mongoose.Schema.Types.Mixed,    
}, {capped: 1000000});

var RGV = mongoose.model ('RGV', rgvSchema, 'test'); //RGV db, test collection.
//end mongoose

// socket.io
var io = require('socket.io').listen(server);
io.sockets.on ('connection', function (socket) {
    // first connection.
    RGV.find (function (err, rgvs) {
	socket.emit('rgv init', rgvs);
    });

    // update when some new data is added.
    var RGVstream = RGV.find().tailable().stream();
    RGVstream.on ('data', function (rgvs) {
      socket.emit('rgv update', rgvs);
    });
});
// end socket.io

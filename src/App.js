const express = require('express');
const path = require('path');
const app = express();

var cookieParser = require('cookie-parser');

require('./db/mongoose');

// Importing Routes:
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const taskRoutes = require('./routes/task');
const baseRoutes = require('./routes/base');

// Parses incoming requests with JSON payloads 
app.use(express.json());
app.use(cookieParser());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'));
app.use(express.static(__dirname + '/public'));

// Registering routes:
app.use(baseRoutes);
app.use(authRoutes);
app.use(userRoutes);
app.use(taskRoutes);

module.exports = app;
const express = require('express');
const path = require('path');
const app = express();

var cookieParser = require('cookie-parser');

require('./db/mongoose');

// Importing Routes:
const baseRoutes = require('./routes/base');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const taskRoutes = require('./routes/task');
const tagRoutes = require('./routes/tag');
const chatRoutes = require('./routes/chat');
const entertainmentRoutes = require('./routes/entertainment');


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
app.use(tagRoutes);
app.use(chatRoutes);
app.use(entertainmentRoutes);

module.exports = app;
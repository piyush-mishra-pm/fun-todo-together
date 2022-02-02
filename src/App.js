const express = require('express');
const app = express();

require('./db/mongoose');

// Importing Routes:
const userRoutes = require('./routes/user');
const taskRoutes = require('./routes/task');

// Parses incoming requests with JSON payloads 
app.use(express.json());

// Registering routes:
app.use(userRoutes);
app.use(taskRoutes);

module.exports = app;
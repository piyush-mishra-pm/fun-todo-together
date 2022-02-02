const express = require('express');
const app = express();

require('./db/mongoose');

// Importing Routes:
const userRoutes = require('./routes/user');

// Parses incoming requests with JSON payloads 
app.use(express.json());

// Registering routes:
app.use(userRoutes);

module.exports = app;
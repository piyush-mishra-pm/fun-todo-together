const express = require('express');

const app = express();

// Parses incoming requests with JSON payloads 
app.use(express.json());

app.get('/', (req, res) => {
    res.send('It Works!');
});

module.exports = app;
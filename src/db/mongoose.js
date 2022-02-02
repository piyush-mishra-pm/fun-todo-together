// Initialises and configures Mongoose to use right MongoDB_URL (set in process.env file)

const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true
});

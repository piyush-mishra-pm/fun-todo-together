const app = require('./app');

const portNumber = process.env.PORT;

app.listen(portNumber, () =>{
    console.log('Server is running on PORT:' + portNumber);
});


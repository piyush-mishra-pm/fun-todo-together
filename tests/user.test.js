const request = require('supertest');
const bcrypt = require('bcrypt');
const { response } = require('../src/app');
const app = require('../src/app');
const User = require('../src/models/user');
const seededDB = require('./fixtures/seededDB');

beforeEach(seededDB.initDatabase);

test('Should Create A new User (SignUp)', async()=>{
    // Assertion about the response status:
    const response = await request(app).post('/user').send({
        name:'Hero',
        email:'hero123@gmail.com',
        password:'Pass123'
    }).expect(201);

    // Assertion about DB entry creation, entry should not be null
    const signedUpUser = await User.findById(response.body.user._id);
    expect(signedUpUser).not.toBeNull();

    // Assertion about response body giving right name and email:
    console.log(response.body);
    expect(response.body).toMatchObject({
        user: {
            name: 'Hero',
            email: 'hero123@gmail.com'
        },
        token: signedUpUser.tokens[0].token
    });

    // Assertion about password not stored as plain text:
    expect(signedUpUser.password).not.toBe('Pass123');

    // Assertion about correctly encrypted pwd stored.
    const isStoredPasswordCorrectlyHashed = await bcrypt.compare('Pass123' , signedUpUser.password);
    expect(isStoredPasswordCorrectlyHashed).toBe(true);

    // Assertion about only 1 token present on a newly signed up user.
    expect(signedUpUser.tokens.length).toBe(1);
});
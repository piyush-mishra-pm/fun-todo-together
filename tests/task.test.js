const request = require('supertest');
const app = require('../src/app');
const Task = require('../src/models/task');
const seededDB = require('./fixtures/seededDB');

beforeEach(seededDB.initDatabase);

test('Should create a new todo task for an authenticated user', async()=>{
    // Assertion about status code:
    const response = await request(app)
        .post('/task')
        .set('Authorization', `Bearer ${seededDB.user1.tokens[0].token}`)
        .send({
            heading:"Heading of Todo Task added by Test",
            detail:"Detailed description of a Todo task that is added by test.",
        }).expect(201);
    
    // Assertion about whether Task even created in DB:
    const task = await Task.findById(response.body.task._id);
    expect(task).not.toBeNull();

    // Assertion about details of task entered correctly or not:
    expect(task.heading).toEqual("Heading of Todo Task added by Test");
    expect(task.detail).toEqual("Detailed description of a Todo task that is added by test.");
    expect(task.done).toEqual(false); // The default is false for 'done' status.
});
const request = require('supertest')
const Task = require('../src/models/task')
const app = require('../src/app')
const {userOneId, userOne,  setupDatabase, userTwo, taskOne} = require('./fixtures/db')

beforeEach(setupDatabase)

test('should create task', async()=>{
   
    const response = await request(app)
    .post('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        description: 'Finish testing with jest',
        completed: 'false'
    }).expect(201)

     const task = await Task.findById(response.body._id)
     expect(task).not.toBeNull()
     expect(task.completed).toBe(false)
})

test('should get all tasks for user one', async()=>{
    const response = await request(app)
          .get('/tasks')
          .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
          .expect(200)
          expect(response.body.length).toBe(2)
})

test('should not delete other user tasks', async()=>{
      await request(app)
      .delete(`/tasks/${taskOne._id}`)
      .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
      .expect(404)

      const task = await Task.findById(taskOne._id)
      expect(task).not.toBeNull()
})
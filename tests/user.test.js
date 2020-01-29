const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const {userOneId, userOne,  setupDatabase} = require('./fixtures/db')



beforeEach(setupDatabase)
test('should sign up user', async()=>{
    const response = await request(app).post('/users').send({
        name: "Avanti",
        email: "avanti.deshmukh532@gmail.com",
        "password": "spyglass"
    }).expect(201)

    //assert that the database changed correctly
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    //assert about the body
    expect(response.body.user.name).toBe('Avanti')

    expect(response.body).toMatchObject({
        user:{
            name: 'Avanti',
            email: "avanti.deshmukh532@gmail.com"
        },
        token: user.tokens[0].token
     
    })
})

test('should login existing user',async()=>{
     const response = await request(app).post('/users/login').send({
         email: userOne.email,
         password: userOne.password
     }).expect(200)

     const user = await User.findOne({email: userOne.email})
     expect(user.tokens[1].token).toBe(response.body.token)
})

test('should not login nonexistent user', async()=>{
    await request(app).post('/users/login').send({
        email: userOne.email,
        password: "mike23"
    }).expect(400)
})

test('should get profile for user', async()=>{
    await request(app)
         .get('/users/me')
         .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
         .send()
         .expect(200)
})

test('should not get profile for unauthenticated user', async()=>{
    await request(app)
          .get('/users/me')
          .send()
          .expect(401)
})

test('should delete account for user', async()=>{
    
    await request(app)
          .delete('/users/me')
          .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
          .send()
          .expect(200)

    const user = await User.findById(userOneId)
    expect(user).toBeNull()
}, 1000)

test('should not delete account for unauthenticated user', async()=>{
    await request(app)
          .delete('/users/me')
          .send()
          .expect(401)
})

test('should upload avatar image', async()=>{
       await request(app)
             .post('/users/me/avatar')
             .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
             .attach('avatar', 'tests/fixtures/profile-pic.jpg')
             .expect(200)

        const user = await User.findById(userOneId)
        expect(user.avatar).toEqual(expect.any(Buffer))     
})

test('should update valid user fields', async()=>{
    await request(app)
          .patch('/users/me')
          .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
          .send({name: "Lily"})
          .expect(200)

     const user = await User.findById(userOneId)  
     expect(user.name).toBe('Lily')   
})

test('should not update invalid user fields', async()=>{
    await request(app)
          .patch('/users/me')
          .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
          .send({location: "Iowa"})
          .expect(400) 
})
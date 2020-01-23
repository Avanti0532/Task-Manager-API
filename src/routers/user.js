const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const {sendWelcomeEmail, cancelEmail} = require('../emails/account')
const User = require('../models/user')
const auth = require('../middleware/auth')
const router = new express.Router()



router.post('/users',async (req, res)=>{
     
    const user = new User(req.body)

    try{
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
       
        res.status(201).send({user,token})
    }catch(e){
        res.status(400).send(e)
    } 
   
})

router.post('/users/login', async(req, res)=>{
    
    try{

       const user = await User.findByCredentials(req.body.email, req.body.password)
       const token = await user.generateAuthToken()
       res.send({user, token})
    
    }catch(e){
       res.status(400).send(e)
    }
})


router.post('/users/logout', auth, async(req, res) =>{
   
       try{
            req.user[0].tokens = req.user[0].tokens.filter((token) => {
    
              return  token.token !== req.token
            })

            await req.user[0].save()
           
            res.send()

       }catch(e){
            res.status(500).send(e)
       }
})

router.post('/users/logoutall', auth, async(req, res)=>{
    try{
        req.user[0].tokens = []
        await req.user[0].save()
           
        res.send()
    }catch(e){
        res.status(500).send(e)
       
    }
})

router.get('/users/me', auth, async(req, res)=>{
    res.send(req.user)

})


router.patch('/users/me', auth, async (req,res)=>{
    const updates = Object.keys(req.body)
   
    const allowedUpdates = ['name', 'age', 'email', 'password']
     const isValidOperation = updates.every((update)=> allowedUpdates.includes(update))
     if(!isValidOperation){
         return res.status(400).send({'error': 'Invalid updates'})
     }
    try{    
         updates.forEach((update)=> req.user[0][update] = req.body[update])
         await req.user[0].save()
         res.send(req.user[0])
    }catch(e){
        res.status(400).send(e)
     }
})

router.delete('/users/me', auth, async(req, res)=>{
         
    try{ 
            await req.user[0].remove()
            cancelEmail(req.user[0].email, req.user[0].name)
            res.send(req.user[0])
    }catch(e){
           res.status(400).send()
    }
})


const upload = multer({
    limits:{
        fileSize: 1000000
    },
    fileFilter(req, file, cb){
        
        if(!file.originalname.match(/\.(jpeg|jpg|png)$/)){
            return cb(new Error('Please upload in jpeg, jpg and png format'))
        }
        
        cb(undefined, true)
    }
})
router.post('/users/me/avatar', auth, upload.single('avatar'),async(req, res)=>{

    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()  
    req.user[0].avatar = buffer
    await req.user[0].save()
    res.send()

}, (error, req, res, next)=>{
    res.status(400).send({error: error.message})
})


router.delete('/users/me/avatar', auth, async(req,res)=>{
    req.user[0].avatar = undefined
    await req.user[0].save()
    res.send()
})

router.get('/users/:id/avatar', async(req, res)=>{

    try{

        const user = await User.findById(req.params.id)
        if(!user || !user.avatar){
            throw new Error('User/User Id does not exist')
        }

        res.set('Content-Type','image/jpg')
        res.send(user.avatar)

    }catch(e){
        res.status(404).send(e.message)

    }

})

module.exports = router
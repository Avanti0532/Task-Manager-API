const express = require('express')
const auth = require('../middleware/auth')
const router = new express.Router()
const Task = require('../models/task')

router.post('/tasks', auth, async(req, res)=>{
    //const task = new Task(req.body)

    const task = new Task({
        ...req.body,
        owner: req.user[0]._id
    })
    try{
        await task.save()
        res.status(201).send(task)
    } catch(e){
        res.status(400).send(e) 
    }
    
})


//GET /tasks?completed=true
//GET /tasks?limit=2&skip=2
//GET /tasks?sortBy=createdAt_asc
router.get('/tasks',auth, async(req, res)=>{
    const match = {}
    const sort = {}
    if(req.query.completed){
        match.completed = req.query.completed === 'true'
    }
    if(req.query.sortBy){
        const parts = req.query.sortBy.split('_')
        sort[parts[0]] = parts[1] === 'desc'? -1 : 1
    }
    
    try{

         await req.user[0].populate({
             path: 'tasks',
             match: match,
             options:{
                 limit: parseInt(req.query.limit),
                 skip:parseInt(req.query.skip),
                 sort:sort
             }
         }).execPopulate()
        res.send(req.user[0].tasks)
    } catch(e){
        res.status(500).send(e)
    }

})

router.get('/tasks/:id',auth, async(req,res)=>{
 
     try{
         
         const task = await Task.findOne({_id: req.params.id, owner: req.user[0]._id})
         if(!task){
            return res.status(404).send()
        }
        res.send(task)
     }catch(e){
        res.status(500).send(e)
     }
})

router.patch('/tasks/:id', async(req,res)=>{
   const updates = Object.keys(req.body)
   const allowedUpdates = ['description','completed']
   const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
  if(!isValidOperation){
      return res.status(400).send({'error':'Invalid updates'})
   }

    try{ 
          const id = req.params.id
          const task = await Task.findOne({_id: req.params.id, owner: req.user[0]._id})
           
          //const task = await Task.findByIdAndUpdate(id, req.body, {new:true, runValidators: true})
          if(!task){
              return res.status(404).send()
            }
            updates.forEach((update)=> {
                task[update] = req.body[update]    
            })
            await task.save()
            res.send(task)
    }catch(e){
         res.status(400).send(e)
    }
})

router.delete('/tasks/:id',auth, async(req, res)=>{
         
    try{
            const id = req.params.id  
            const task = await Task.findOneAndDelete({_id: id, owner: req.user[0]._id})
             if(!task){
                 return res.status(404).send()
             }
             res.send(task)
    }catch(e){
           res.status(400).send()
    }
})

module.exports = router
import express from 'express'
import { addMemberController, createSpaceController, deleteSpaceController, getSpaceById, getSpacesController, removeMemberController } from '../controller/space.controller.js'
import userAuth from '../middleware/userAuth.js'

const spaceRouter = express.Router()

spaceRouter.post('/createSpace',userAuth,createSpaceController)
spaceRouter.get('/getSpace/:id',userAuth,getSpaceById)
spaceRouter.put('/addMember/:id',userAuth,addMemberController)
spaceRouter.put('/removeMember/:id',userAuth,removeMemberController)
spaceRouter.delete('/deleteSpace/:id',userAuth,deleteSpaceController)
spaceRouter.get('/getAllSpaces',userAuth,getSpacesController)

export default spaceRouter

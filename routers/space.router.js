import express from 'express'
import { addMemberController, createSpaceController, deleteSpaceController, getSpaceById, getSpacesController, makeAdminController, removeMemberController } from '../controller/space.controller.js'
import userAuth from '../middleware/userAuth.js'

const spaceRouter = express.Router()

spaceRouter.post('/createSpace',userAuth,createSpaceController)  // owner can do
spaceRouter.get('/getSpace/:id',userAuth,getSpaceById) 
spaceRouter.put('/addMember/:id',userAuth,addMemberController) // owner and admin can do
spaceRouter.put('/removeMember/:id',userAuth,removeMemberController) // owner and admin can do
spaceRouter.delete('/deleteSpace/:id',userAuth,deleteSpaceController) // owner can do
spaceRouter.get('/getAllSpaces',userAuth,getSpacesController) // it is for all who all are part of space 

spaceRouter.put('/makeAdmin/:spaceId/:userId', userAuth, makeAdminController)  // only owner can do 


export default spaceRouter

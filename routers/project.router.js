import express from 'express'
import userAuth from '../middleware/userAuth.js'
import { createProjectController } from '../controller/project.controller.js'

const projectRouter = express.Router()

projectRouter.post('/createProject',userAuth,createProjectController)

export default projectRouter
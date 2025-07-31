import express from 'express'
import userAuth from '../middleware/userAuth.js'
import { addMemberToProjectController, createProjectController, getMembersForProject, getProjectsUnderSpaceController, removeMemberFromProjectController } from '../controller/project.controller.js'

const projectRouter = express.Router()

projectRouter.post('/createProject/:spaceId',userAuth,createProjectController)

projectRouter.put('/:projectId/add-member', userAuth, addMemberToProjectController);// owner/admin of space
projectRouter.put('/:projectId/remove-member', userAuth, removeMemberFromProjectController); // owner/admin

projectRouter.get(':projectId/available-users',userAuth,getMembersForProject)

projectRouter.get("/getProjectsUnderSpace/:spaceId", userAuth, getProjectsUnderSpaceController);



export default projectRouter
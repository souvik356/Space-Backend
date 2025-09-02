import express from 'express'
import userAuth from '../middleware/userAuth.js'
import { addMemberToProjectController, createProjectController, editProjectController, getMembersForProject, getPipelinesForProject, getPipelinesWithTasks, getProjectDetailController, getProjectMembersController, getProjectsUnderSpaceController, getProjectsWithPipelines, getSpaceUsers, removeMemberFromProjectController } from '../controller/project.controller.js'
import { createPipelineController, listPipelinesController, listTasksInPipelineController } from '../controller/pipeline.controller.js';

const projectRouter = express.Router()


// Pipelines
projectRouter.post("/pipelines", userAuth, createPipelineController);

projectRouter.get("/:projectId/pipelines", userAuth, listPipelinesController);

// Tasks under a pipeline
// projectRouter.post("/:projectId/pipelines/:pipelineId/tasks", userAuth, createTaskUnderPipelineController);
projectRouter.get("/:projectId/pipelines/:pipelineId/tasks", userAuth, listTasksInPipelineController);


// create a project
projectRouter.post('/createProject/:spaceId',userAuth,createProjectController)




projectRouter.put('/:projectId/add-member', userAuth, addMemberToProjectController);// owner/admin of space
projectRouter.put('/:projectId/remove-member', userAuth, removeMemberFromProjectController); // owner/admin

projectRouter.get(':spaceId/available-users',userAuth,getMembersForProject)

projectRouter.get("/getProjectsUnderSpace/:spaceId", userAuth, getProjectsUnderSpaceController);

// to get availabe users while creating project
projectRouter.get('/space-users/:spaceId', userAuth, getSpaceUsers);

// show pipeline with task
projectRouter.get("/:projectId/pipelines-with-tasks",userAuth, getPipelinesWithTasks);

// show available pipleline for task
projectRouter.get("/projects/:projectId/pipelines",userAuth,getPipelinesForProject)

// show project with pipeline
projectRouter.get('/getProjectWithPipeline',userAuth,getProjectsWithPipelines)

projectRouter.put('/editProject/:spaceId/:projectId',userAuth,editProjectController)




// use this api to get available members from projects to be asssigned to task
projectRouter.get('/getProjectMembers//:projectId/members',userAuth,getProjectMembersController)

projectRouter.get('/project-details/:projectId',userAuth,getProjectDetailController)

export default projectRouter
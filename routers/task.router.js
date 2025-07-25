import express from 'express';
import userAuth from '../middleware/userAuth.js';
import { createTaskController } from '../controller/task.controller.js';

const taskRouter = express.Router();

// POST /api/tasks/:projectId/create
taskRouter.post('/:projectId/createTask', userAuth, createTaskController);

export default taskRouter;

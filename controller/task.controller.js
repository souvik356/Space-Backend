import TaskModel from '../model/Task.js';
import ProjectModel from '../model/Project.js';
import SpaceModel from '../model/Space.js';

// POST /api/tasks
export const createTaskController = async (req, res) => {
  try {
    const { projectId, pipelineId, taskName, description = "", startDate, endDate, assignedTo, attachments = [] } = req.body;
    const loggedInUser = req.user;

    if (!projectId || !pipelineId || !taskName?.trim()) {
      return res.status(400).json({
        message: "Project, Pipeline and Task name are required",
        success: false,
        error: true,
      });
    }

    const project = await ProjectModel.findById(projectId);
    if (!project) {
      return res.status(404).json({
        message: "Project not found",
        success: false,
        error: true,
      });
    }

    const space = await SpaceModel.findById(project.spaceId);
    if (!space) {
      return res.status(404).json({
        message: "Space not found",
        success: false,
        error: true,
      });
    }

    // only members can create tasks
    const isMember = project.members.some(
      (id) => id.toString() === loggedInUser._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({
        message: "Only project members can create tasks",
        success: false,
        error: true,
      });
    }

    const pipeline = project.pipelines.id(pipelineId);
    if (!pipeline) {
      return res.status(404).json({
        message: "Pipeline not found in this project",
        success: false,
        error: true,
      });
    }

    const newTask = {
      taskName: taskName.trim(),
      description,
      startDate: startDate || null,
      endDate: endDate || null,
      status: "To Do",  // default
      assignedTo: assignedTo || null, // userId
      attachments,
    };

    pipeline.tasks.push(newTask);
    await project.save();

    const createdTask = pipeline.tasks[pipeline.tasks.length - 1];

    return res.status(201).json({
      message: "Task created successfully",
      data: createdTask,
      success: true,
      error: false,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Something went wrong",
      success: false,
      error: true,
    });
  }
};


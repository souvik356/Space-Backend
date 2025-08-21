import TaskModel from '../model/Task.js';
import ProjectModel from '../model/Project.js';
import SpaceModel from '../model/Space.js';

// POST /api/tasks
export const createTaskController = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { pipelineId, taskName, description, startDate, endDate, assignedTo, attachments } = req.body;
    const loggedInUser = req.user;

    if (!pipelineId || !taskName?.trim()) {
      return res.status(400).json({
        message: "Pipeline and Task name are required",
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

    // find the pipeline inside project
    const pipeline = project.pipelines.id(pipelineId);
    if (!pipeline) {
      return res.status(404).json({
        message: "Pipeline not found in this project",
        success: false,
        error: true,
      });
    }

    // push the task into pipeline
    pipeline.tasks.push({
      taskName,
      description,
      startDate: startDate || null,
      endDate: endDate || null,
      status: "To Do",
      assignedTo: assignedTo || null,
      attachments: attachments || [],
    });

    await project.save();

    return res.status(201).json({
      message: "Task created successfully",
      success: true,
      error: false,
      data: pipeline.tasks[pipeline.tasks.length - 1], 
    });
  } catch (err) {
    return res.status(500).json({
      message: err?.message || "Internal Server Error",
      success: false,
      error: true,
    });
  }
};



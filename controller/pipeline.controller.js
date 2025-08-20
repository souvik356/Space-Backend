import ProjectModel from "../model/Project.js";
import SpaceModel from "../model/Space.js";
import UserModel from "../model/User.js";
import TaskModel from "../model/Task.js";

// helper: check owner/admin of space
const isOwnerOrAdminOfSpace = (space, userId) => {
  const uid = userId.toString();
  const owner = space.ownerId?.toString() === uid;
  const admin = (space.admin || []).some((id) => id.toString() === uid);
  return owner || admin;
};
// POST /api/pipelines - to create pipeline
export const createPipelineController = async (req, res) => {
    try {
      const { projectId, name, description = "", startDate, endDate } = req.body;
      const loggedInUser = req.user;
  
      if (!projectId || !name?.trim()) {
        return res.status(400).json({
          message: "Project ID and Pipeline name are required",
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
  
      // Only owner/admin can create
      const isOwner = space.ownerId.toString() === loggedInUser._id.toString();
      const isAdmin = space.admin.some(
        (id) => id.toString() === loggedInUser._id.toString()
      );
      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          message: "Only owner/admin can create pipelines",
          success: false,
          error: true,
        });
      }
  
      // push pipeline
      project.pipelines.push({
        name: name.trim(),
        description,
        startDate: startDate || null,
        endDate: endDate || null,
        tasks: [],
      });
  
      await project.save();
  
      const createdPipeline = project.pipelines[project.pipelines.length - 1];
      return res.status(201).json({
        message: "Pipeline created successfully",
        data: createdPipeline,
        success: true,
        error: false,
      });
    } catch (err) {
      return res.status(500).json({
        message: err?.message || "Something went wrong",
        success: false,
        error: true,
      });
    }
  };
  
  

// GET /api/projects/:projectId/pipelines
export const listPipelinesController = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await ProjectModel.findById(projectId).populate({
      path: "pipelines.tasks",
      select: "title status assignedTo startDate endDate",
      populate: { path: "assignedTo", select: "name email" },
    });

    if (!project) {
      return res
        .status(404)
        .json({ message: "Project not found", success: false, error: true });
    }

    return res.status(200).json({
      message: "Pipelines fetched",
      data: project.pipelines || [],
      success: true,
      error: false,
    });
  } catch (err) {
    return res
      .status(500)
      .json({
        message: err?.message || String(err),
        success: false,
        error: true,
      });
  }
};


// GET /api/projects/:projectId/pipelines/:pipelineId/tasks
export const listTasksInPipelineController = async (req, res) => {
  try {
    const { projectId, pipelineId } = req.params;

    const project = await ProjectModel.findById(projectId);
    if (!project) {
      return res.status(404).json({
        message: "Project not found",
        success: false,
        error: true,
      });
    }

    const pipeline = (project.pipelines || []).find(
      (p) => p._id.toString() === pipelineId
    );
    if (!pipeline) {
      return res.status(404).json({
        message: "Pipeline not found",
        success: false,
        error: true,
      });
    }

    // fetch all tasks under this pipeline
    const tasks = await TaskModel.find({
      _id: { $in: pipeline.tasks },
    })
      .populate("assignedTo", "name email")
      .populate("assignee", "name email");

    return res.status(200).json({
      message: "Tasks fetched successfully",
      data: tasks,
      success: true,
      error: false,
    });
  } catch (err) {
    return res.status(500).json({
      message: err?.message || String(err),
      success: false,
      error: true,
    });
  }
};

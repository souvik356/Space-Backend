import TaskModel from '../model/Task.js';
import ProjectModel from '../model/Project.js';
import SpaceModel from '../model/Space.js';

export const createTaskController = async (req, res) => {
  try {
    const { projectId } = req.params;
    const loggedInUser = req.user;

    const {
      title,
      attachment = [],
      assignedTo,
      status = 'To Do',
      deadline,
    } = req.body;

    if (!title || !assignedTo || !deadline) {
      return res.status(400).json({
        message: 'title, assignedTo and deadline are required',
        success: false,
        error: true,
      });
    }

    // 1) Project exists?
    const project = await ProjectModel.findById(projectId);
    if (!project) {
      return res.status(404).json({
        message: 'Project not found',
        success: false,
        error: true,
      });
    }

    // 2) Space exists?
    const space = await SpaceModel.findById(project.spaceId);
    if (!space) {
      return res.status(404).json({
        message: 'Space not found for this project',
        success: false,
        error: true,
      });
    }

    // 3) Permission: owner or admin of space
    const isOwner = space.ownerId.toString() === loggedInUser._id.toString();
    const isAdmin = space.admin.some(
      (id) => id.toString() === loggedInUser._id.toString()
    );

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: 'Only space owner/admin can create a task',
        success: false,
        error: true,
      });
    }

    // 4) assignedTo must be a member of the space (or owner/admin)
    const assignedToInSpace =
      space.ownerId.toString() === assignedTo ||
      space.admin.some((id) => id.toString() === assignedTo) ||
      space.members.some((id) => id.toString() === assignedTo);

    if (!assignedToInSpace) {
      return res.status(400).json({
        message: 'assignedTo user is not a member of this space',
        success: false,
        error: true,
      });
    }

    // (Optional) ensure the assignedTo is part of the project; if not, you can auto-add:
    if (!project.members.some((id) => id.toString() === assignedTo)) {
      project.members.push(assignedTo);
    }

    // 5) Create task
    const task = await TaskModel.create({
      title,
      projectId,
      attachment,
      assignee: loggedInUser._id, // who created/assigned it
      assignedTo,
      status,
      deadline,
    });

    // 6) Push into proper pipeline OR npTask fallback
    const pipeline = project.Pipelines?.find((p) => p.status === status);
    if (pipeline) {
      pipeline.Task.push(task._id);
    } else {
      // if no pipeline found for that status, push to npTask
      project.npTask.push(task._id);
    }

    await project.save();

    return res.status(201).json({
      message: 'Task created successfully',
      data: task,
      success: true,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({
      message: error?.message || String(error),
      success: false,
      error: true,
    });
  }
};

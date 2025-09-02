// spaceId inside (Project)
import ProjectModel from "../model/Project.js";
import SpaceModel from "../model/Space.js";
import UserModel from "../model/User.js";

// owner or admin can create
export const createProjectController = async (req, res) => {
  try {
    const { spaceId } = req.params;
    const loggedInUser = req.user;

    const { projectName, description, members = [], endDate } = req.body;
    if (!projectName || !description) {
      return res.status(400).json({
        message: "please add project name and description",
        error: true,
        success: false,
      });
    }

    const space = await SpaceModel.findById(spaceId);
    if (!space) {
      return res.status(400).json({
        message: "space not exist",
        error: true,
        success: false,
      });
    }

    const isOwner = space.ownerId.toString() === loggedInUser._id.toString();
    const isAdmin = space.admin.some(
      (id) => id.toString() === loggedInUser._id.toString()
    );

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "only admin or owner can create project",
        error: true,
        success: false,
      });
    }

    // add loggedInUser as default member
    const uniqueMembers = Array.from(
      new Set([...(members || []), loggedInUser._id.toString()])
    );

    const project = new ProjectModel({
      projectName,
      spaceId,
      description,
      endDate: endDate || null,
      members: uniqueMembers,
      pipelines: [], // keep empty, pipelines will be created separately
    });

    const savedProject = await project.save();

    space.projects.push(project._id);
    await space.save();

    return res.status(201).json({
      message: "Project created successfully",
      error: false,
      success: true,
      data: savedProject,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Internal Server Error",
      success: false,
      error: true,
    });
  }
};


export const addMemberToProjectController = async (req, res) => {
  try {
    const loggedInUser = req.user;
    const { projectId } = req.params;
    const { memberId } = req.body;

    const project = await ProjectModel.findById(projectId);
    if (!project) {
      return res.status(400).json({
        message: "No project exist with this projectId",
        error: true,
        success: false,
      });
    }
    // console.log('project-detail',project)
    const space = await SpaceModel.findById(project.spaceId);
    if (!space) {
      return res.status(400).json({
        message: "space doesnot exist",
        error: true,
        success: false,
      });
    }
    // console.log('space-details',space)

    // check loggedInUser is owner or admin

    const isOwner = space.ownerId.toString() === loggedInUser._id.toString();
    const isAdmin = space.admin.some(
      (id) => id.toString() === loggedInUser.toString()
    );
    // console.log("isAdmin,isOwner", isAdmin, isOwner);

    if (!isOwner && !isAdmin) {
      return res.status(400).json({
        message: "only owner or admin can member to project",
        error: true,
        success: false,
      });
    }

    const memberInSpace =
      space.ownerId.toString() === memberId ||
      space.admin.some((id) => id.toString() === memberId) ||
      space.members.some((id) => id.toString() === memberId);

    // console.log("memberInSpace", memberInSpace);

    if (!memberInSpace) {
      return res.status(400).json({
        message: "User is not a member of the space",
        error: true,
        success: false,
      });
    }

    if (project.members.some((id) => id.toString() === memberId)) {
      return res.status(400).json({
        message: "User already member of project",
        error: true,
        success: false,
      });
    }

    project.members.push(memberId);
    await project.save();

    res.status(200).json({
      message: "Member added to project",
      data: project,
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: `${error || error.message}`,
      success: false,
      error: true,
    });
  }
};

export const removeMemberFromProjectController = async (req, res) => {
  try {
    const loggedInUser = req.user;
    const { projectId } = req.params;
    const { memberId } = req.body;

    const project = await ProjectModel.findById(projectId);
    if (!project) {
      return res.status(400).json({
        message: "No project exist with this projectId",
        error: true,
        success: false,
      });
    }
    // console.log('project-detail',project)
    const space = await SpaceModel.findById(project.spaceId);
    if (!space) {
      return res.status(400).json({
        message: "space doesnot exist",
        error: true,
        success: false,
      });
    }
    // console.log('space-details',space)

    // check loggedInUser is owner or admin

    const isOwner = space.ownerId.toString() === loggedInUser._id.toString();
    const isAdmin = space.admin.some(
      (id) => id.toString() === loggedInUser.toString()
    );
    console.log("isAdmin,isOwner", isAdmin, isOwner);

    if (!isOwner && !isAdmin) {
      return res.status(400).json({
        message: "only owner or admin can remove member to project",
        error: true,
        success: false,
      });
    }

    project.members = project.members.filter((m) => m.toString() !== memberId);
    await project.save();

    res
      .status(200)
      .json({
        message: "Member removed from project",
        project,
        success: true,
        error: false,
      });
  } catch (error) {
    return res.status(500).json({
      message: `${error || error.message}`,
      success: false,
      error: true,
    });
  }
};

export const getMembersForProject = async (req,res) => {
  try {
    const {spaceId} = req.params
    const loggedInUser= req.user
    const project = await ProjectModel.findById(projectId)
    if(!project){
      return res.status(400).json({
        message:"Project not found",
        error: true,
        success: false
      })
    }
    const space = await SpaceModel.findById(project.spaceId)
    if(!space){
      return res.status(400).json({
        message:"space not found",
        error: true,
        success: false
      })
    }

    const spaceMemberIds = [...space.members,space.ownerId,...space.admin]
    const alreadyInProject = project.members

    const availableUsers = await UserModel.find({
      _id:{$in: spaceMemberIds,$nin:alreadyInProject}
    })

    return res.status(200).json({
      message:'members details fetched successfully',
      data: availableUsers,
      success: true,
      error: false
    })

  } catch (error) {
    return res.status(500).json({
      message: `${error || error.message}`,
      success: false,
      error: true,
    });
  }
}

export const getProjectsUnderSpaceController = async (req, res) => {
  try {
    const { spaceId } = req.params;

    const space = await SpaceModel.findById(spaceId).populate({
      path: "projects",
      populate: {
        path: "members",
        select: "name email"
      }
    });

    if (!space) {
      return res.status(400).json({
        message: "Space not found",
        error: true,
        success: false,
      });
    }

    return res.status(200).json({
      message: "Projects under space fetched successfully",
      data: space.projects,
      success: true,
      error: false,
    });

  } catch (error) {
    return res.status(500).json({
      message: `${error || error.message}`,
      error: true,
      success: false,
    });
  }
};

export const getSpaceUsers = async (req, res) => {
  try {
    const { spaceId } = req.params;
    const space = await SpaceModel.findById(spaceId);
    if (!space) return res.status(404).json({ message: "Space not found" });

    const userIds = [
      space.ownerId.toString(),
      ...space.admin.map(id => id.toString()),
      ...space.members.map(id => id.toString())
    ];
    const users = await UserModel.find({ _id: { $in: userIds } }).select("name email");

    return res.status(200).json({
      message: "Space users fetched",
      data: users,
      success: true,
      error: false
    });
  } catch (e) {
    return res.status(500).json({ message: e.message, success: false, error: true });
  }
};



// GET /api/projects
export const getAllProjectsController = async (req, res) => {
  try {
    const loggedInUser = req.user;

    // Fetch projects where user is member/admin/owner
    const projects = await ProjectModel.find({
      members: loggedInUser._id,
    }).select("projectName description");

    return res.status(200).json({
      message: "Projects fetched successfully",
      data: projects,
      success: true,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Something went wrong",
      success: false,
      error: true,
    });
  }
};

// GET /api/projects/:projectId/pipelines (available pipline to create task)
export const getPipelinesForProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const loggedInUser = req.user;

    const project = await ProjectModel.findById(projectId).select("pipelines spaceId");
    if (!project) {
      return res.status(404).json({
        message: "Project not found",
        success: false,
        error: true,
      });
    }

    // Ensure user belongs to this project
    if (!project.members.includes(loggedInUser._id)) {
      return res.status(403).json({
        message: "You are not a member of this project",
        success: false,
        error: true,
      });
    }

    return res.status(200).json({
      message: "Pipelines fetched successfully",
      data: project.pipelines.map((p) => ({
        _id: p._id,
        name: p.name,
        description: p.description,
      })),
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

// GET /api/projects/:projectId/pipelines-with-tasks (it will show pipeline with task under project)
export const getPipelinesWithTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const loggedInUser = req.user;

    if (!loggedInUser || !loggedInUser._id) {
      return res.status(401).json({
        message: "Unauthorized: user not found",
        success: false,
        error: true,
      });
    }

    const project = await ProjectModel.findById(projectId)
      .populate({
        path: "pipelines.tasks",
        populate: { path: "assignedTo", select: "name email" },
      });

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
        success: false,
        error: true,
      });
    }

    const isMember = project.members.some(
      (id) => id.toString() === loggedInUser._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
        success: false,
        error: true,
      });
    }

    return res.status(200).json({
      message: "Pipelines with tasks fetched successfully",
      data: project.pipelines,
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



// GET /api/dashboard/projects  (api to show project and pipeline )
export const getProjectsWithPipelines = async (req, res) => {
  try {
    const loggedInUser = req.user;

    // find all projects where user is a member
    const projects = await ProjectModel.find({
      members: loggedInUser._id,
    })
      .populate("spaceId", "name") // populate space name
      .exec();

    if (!projects.length) {
      return res.status(404).json({
        message: "No projects found for this user",
        success: false,
        error: true,
      });
    }

    const data = projects.map((project) => ({
      _id: project._id,
      projectName: project.projectName,
      description: project.description,
      space: project.spaceId ? { _id: project.spaceId._id, name: project.spaceId.name } : null,
      pipelines: (project.pipelines || []).map((pl) => ({
        _id: pl._id,
        name: pl.name,
        description: pl.description,
        startDate: pl.startDate,
        endDate: pl.endDate,
      })),
    }));

    return res.status(200).json({
      message: "Projects with pipelines fetched successfully",
      data,
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

// PUT /api/projects/:spaceId/:projectId
export const editProjectController = async (req, res) => {
  try {
    const { spaceId, projectId } = req.params;
    const loggedInUser = req.user;
    const { projectName, description, members, endDate, status } = req.body;

    // find space
    const space = await SpaceModel.findById(spaceId);
    if (!space) {
      return res.status(404).json({
        message: "Space not found",
        success: false,
        error: true,
      });
    }

    // check permissions (owner or admin)
    const isOwner = space.ownerId.toString() === loggedInUser._id.toString();
    const isAdmin = space.admin.some(
      (id) => id.toString() === loggedInUser._id.toString()
    );

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "Only owner or admin can edit a project",
        success: false,
        error: true,
      });
    }

    // find project inside this space
    const project = await ProjectModel.findOne({ _id: projectId, spaceId });
    if (!project) {
      return res.status(404).json({
        message: "Project not found in this space",
        success: false,
        error: true,
      });
    }

    // update fields (if provided)
    if (projectName) project.projectName = projectName;
    if (description) project.description = description;
    if (endDate) project.endDate = endDate;
    if (status) project.status = status;

    // update members (optional)
    if (Array.isArray(members)) {
      // ensure no duplicates
      const uniqueMembers = Array.from(new Set(members.map(m => m.toString())));
      project.members = uniqueMembers;
    }

    const updatedProject = await project.save();

    return res.status(200).json({
      message: "Project updated successfully",
      success: true,
      error: false,
      data: updatedProject,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Internal Server Error",
      success: false,
      error: true,
    });
  }
};












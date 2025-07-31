// spaceId inside (Project)

import ProjectModel from "../model/Project.js";
import SpaceModel from "../model/Space.js";
import UserModel from "../model/User.js";

// owner or admin can create
export const createProjectController = async (req, res) => {
  try {
    const { spaceId } = req.params;
    const loggedInUser = req.user;
    // console.log(spaceId);

    const { projectName, description, members=[],endDate } = req.body;
    if (!projectName || !description) {
      return res.status(400).json({
        message: "please add project name and description",
        error: false,
        success: false,
      });
    }

    const space = await SpaceModel.findById(spaceId);
    // console.log("space", space);
    if (!space) {
      return res.status(400).json({
        message: "space not exist",
        error: false,
        success: false,
      });
    }

    const isOwner = space.ownerId.toString() === loggedInUser._id.toString();
    const isAdmin = space.admin.some(
      (id) => id.toString() === loggedInUser._id.toString()
    );
    // const {projectName,description}=req.body

    if (!isOwner && !isAdmin) {
      return res.status(400).json({
        message: "only admin or owner can create project",
        error: false,
        success: false,
      });
    }

    const uniqueMembers = Array.from(
      new Set([...(members || []), loggedInUser._id.toString()])
    );

    const project = new ProjectModel({
      projectName,
      spaceId: spaceId,
      endDate: endDate || null,
      description,
      members: uniqueMembers,
      Pipelines: [
        { status: "To Do", Task: [] },
        { status: "In Progress", Task: [] },
        { status: "Done", Task: [] },
      ],
    });
    const savedProject = await project.save();
    // console.log(savedProject);
    space.projects.push(project._id);
    await space.save();

    return res.status(200).json({
      message: "Project created successfully",
      error: false,
      success: true,
      data: savedProject,
    });
  } catch (error) {
    return res.status(500).json({
      message: `${error || error.message}`,
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
    const {projectId} = req.params
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

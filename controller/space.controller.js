import SpaceModel from "../model/Space.js";
import UserModel from "../model/User.js";

export const createSpaceController = async (req, res) => {
  try {
    const { spaceName, description } = req.body;
    const loggedInUser = req.user;
    if (!spaceName || !description) {
      return res.status(400).json({
        message: "please give space name and description",
        error: true,
        succes: false,
      });
    }
    const space = new SpaceModel({
      spaceName,
      description,
      ownerId: loggedInUser._id,
      members: [loggedInUser._id],
    });
    const Space = await space.save();

    await UserModel.findByIdAndUpdate(
      { _id: loggedInUser._id },
      { $push: { spaces: space._id } }
    );

    return res.status(200).json({
      message: "Space created successfully",
      data: Space,
      success: true,
      error: false,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create space " + error,
      error: true,
      succes: false,
    });
  }
};

export const getSpaceById = async (req, res) => {
  try {
    const loggedInUser = req.user;
    const space = await SpaceModel.findById(req.params.id)
      .populate("ownerId", "name email")
      .populate("members", "name email");

    if (!space) {
      return res.status(400).json({
        message: "no such space found",
        error: false,
        success: true,
      });
    }

    return res.status(200).json({
      message: "Space data fetched succesfully",
      data: space,
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error in fetching" + error,
      error: false,
      success: true,
    });
  }
};

export const addMemberController = async (req, res) => {
  try {
    const loggedInUser = req.user; // souvik
    const { memberId } = req.body; // prasad

    const space = await SpaceModel.findById(req.params.id);

    const isOwner= space.ownerId.toString() === loggedInUser._id.toString()
    const isAdmin = space.admin.some(id => id.toString()===loggedInUser._id.toString() )

    if (!isOwner && !isAdmin) {
      return res.status(400).json({
        message: "Only owner or admin can add",
        error: true,
        success: false,
      });
    }


    if (space.members.includes(memberId)) {
      return res.status(400).json({
        message: "member already exist",
        error: true,
        success: false,
      });
    }

    space.members.push(memberId);
    await space.save();

    await UserModel.findByIdAndUpdate(memberId, {
      $push: { spaces: space._id },
    });

    return res.status(200).json({
      message: "member added",
      success: true,
      error: false,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add member" + error || error.message,
      error: true,
      success: false,
    });
  }
};

// only
export const removeMemberController = async (req, res) => {
  try {
    const loggedInUser = req.user;
    const { memberId } = req.body;
    const space = await SpaceModel.findById(req.params.id);

    if (!space) {
      return res.status(400).json({
        message: "no space found",
        error: true,
        success: false,
      });
    }

    const isOwner= loggedInUser._id.toString() === space.ownerId.toString()
    const isAdmin = space.admin.some(id => id.toString() === loggedInUser._id.toString())

    if (!isOwner && !isAdmin) {
      return res.status(400).json({
        message: "only owner or admin can remove",
        error: true,
        success: false,
      });
    }

    if (memberId === space.ownerId.toString()) {
      return res.status(400).json({
        message: "owener cannot remove himself",
        error: true,
        success: false,
      });
    }

    space.members.pull(memberId);
    await space.save();

    await UserModel.findByIdAndUpdate(memberId, {
      $pull: { spaces: space._id },
    });

    return res.status(200).json({
      message: "member removed",
      success: true,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({
      message: `failed to remove member ${error || error.message}`,
      success: false,
      error: true,
    });
  }
};

// only owner can remove spaces
// :id(spaceId) - get id from routes as param
export const deleteSpaceController = async (req, res) => {
  try {
    const spaceId = req.params.id;
    const loggedInUser = req.user;
    const isSpaceInDb = await SpaceModel.findById(spaceId);

    if (!isSpaceInDb) {
      return res.status(400).json({
        message: "Space not found",
        success: false,
        error: true,
      });
    }

    if (loggedInUser._id.toString() !== isSpaceInDb.ownerId.toString()) {
      return res.status(400).json({
        message: "only owner can delete space",
        success: false,
        error: true,
      });
    }

    await SpaceModel.findByIdAndDelete(spaceId);

    return res.status(200).json({
      message: "space deleted successfully",
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

// when a user is loggedin he can see his created space and the space he is part of - logic
export const getSpacesController = async (req, res) => {
  try {
    const loggedInUser = req.user;
    const spaces = await SpaceModel.find({
      $or: [{ ownerId: loggedInUser._id }, { members: loggedInUser._id }],
    });

    return res.status(200).json({
      message: "All spaces fetched successfully",
      data: spaces,
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

// only owner can make admin
// admin to be choosed from member
export const makeAdminController = async (req, res) => {
  try {
    const loggedInUser = req.user;
    const { spaceId, userId } = req.params;

    const isSpaceInDb = await SpaceModel.findById(spaceId);
    if (!isSpaceInDb) {
      return res.status(400).json({
        message: "space not found",
        error: true,
        success: false,
      });
    }

    if (isSpaceInDb.ownerId.toString !== loggedInUser._id.toString()) {
      return res.status(400).json({
        message: "only owner can assign admin",
        error: true,
        success: false,
      });
    }

    // checking if userId exist in memebers
    if (!isSpaceInDb.members.includes(userId)) {
      return res.status(400).json({
        message: "user not part of member",
        error: true,
        success: false,
      });
    }

    if (!isSpaceInDb.admin.includes(userId)) {
      isSpaceInDb.push.admin(userId);
      await isSpaceInDb.save();
    }

    return res
      .status(200)
      .json({ message: "User promoted to admin",error:false,success: true,data: isSpaceInDb });
  } catch (error) {
    return res.status(500).json({
      message: `${error || error.message}`,
      success: false,
      error: true,
    });
  }
};

export const getAvailableUsersForSpace =async (req,res) => {
  try {
    const loggedInUser=req.user
    const {spaceId}=req.params
    const space= await SpaceModel.findById(spaceId)
    if(!space){
      return res.status(400).json({
        message:'No space found',
        success: false,
        error:true
      })
    }
    console.log(space)

    const existingMember = [space.ownerId,...space.members,...space.admin]
    const availableUser = await UserModel.find({_id:{$nin: existingMember}})

    return res.status(200).json({
      message:'Available user fetched successfully',
      data: availableUser,
      success: true,
      error: false,
    })

  } catch (error) {
    return res.status(500).json({
      message: `${error || error.message}`,
      success: false,
      error: true,
    });
  }
}
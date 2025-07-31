import mongoose from "mongoose";

const spaceSchema=mongoose.Schema({
    spaceName:{
        type: String
    },
    description:{
        type: String
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true
    },
    
    members:[{type: mongoose.Schema.Types.ObjectId, ref:'User'}],
    admin:[{type: mongoose.Schema.Types.ObjectId, ref:'User'}],
    projects:[{
        type: mongoose.Schema.Types.ObjectId,ref:'Project'
    }]
},{
    timestamps: true
})

const SpaceModel = mongoose.model('Space',spaceSchema)
export default SpaceModel


// add role 

// space- BU units
  // Tigo Agent app - project
  // 
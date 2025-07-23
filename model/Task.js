import mongoose from "mongoose";

const TaskSchema= mongoose.Schema({
    title:{
        type: String
    },
    projectId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    attachment:[{type: String}], // attaching name , description , linkOfAttachment
    assignee:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedTo:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status:{
        type : String,
        enum : ['To Do', 'In Progress','Done'],
        required: true,
        default: 'To Do'
    },
    deadline: {
        type : Date,
        required: true
    }
},{timestamps:true})

const TaskModel = mongoose.model('Task',TaskSchema)

export default TaskModel
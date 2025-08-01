import mongoose from "mongoose";

const ProjectSchema = mongoose.Schema({
    projectName:{
        type: String,
        required: true
    },
    spaceId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Space',
        required: true
    },
    description:{
        type: String,
        required: true
    },

    Pipelines:[{
        status:{
            type: String,                                    // [task 1 ,task2, task3]
            enum:['To Do','In Progress','Done'],
            required: true  
        },
        Task:[{
            type: mongoose.Schema.Types.ObjectId,
            ref:'Task'
        }]
    }],

    npTask:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Task'
    }],

    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    endDate:{
        type: Date,
        validate: (value)=>{
           return value > new Date()
        },
        message:'End date must be greater then present date'
    },

    // phases of project

    status: {
        type: String,
        enum :['To Do','In progress','Done'],
        default:'In Progress'
    }

},{
    timestamps: true
})

const ProjectModel = mongoose.model('Project',ProjectSchema)

export default ProjectModel
import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    name:{
        type: String
    },
    email:{
        type: String
    },
    passwordHash:{
        type: String
    },
    spaces: [{type: mongoose.Schema.Types.ObjectId,ref:'Space'}]
    
},{
    timestamps: true
})

const UserModel = mongoose.model('User',userSchema)

export default UserModel
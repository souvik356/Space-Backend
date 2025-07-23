import validator from "validator";
import bcrypt from 'bcrypt'
import UserModel from "../model/User.js";
import jwt from 'jsonwebtoken'

export const registerController = async (req, res) => {
  try {
    const { name, email, passwordHash } = req.body;
    if (!name || !email || !passwordHash) {
      return res.status(400).json({
        message: "please provide field",
        error: true,
        success: false,
      });
    }
    if(!validator.isEmail(email)){
        return res.status(400).json({
            message: 'Please provide valid email must include @ & .com',
            error: true,
            succes: false
        })
    }
    if(!validator.isStrongPassword(passwordHash)){
        return res.status(400).json({
            message:'Please provide valid password inlcude special case and start with uppercase',
            error: true,
            succes: false
        })
    }

    const isUserExist = await UserModel.findOne({email:email})
    if(isUserExist){
        return res.status(400).json({
            message:'Email already exist Please login',
            error: true,
            success: false
        })
    }
    const hashedPassword = await bcrypt.hash(passwordHash,10)

    const user= new UserModel({
        name,
        email,
        passwordHash: hashedPassword
    })

    const savedData= await user.save()

    return res.status(200).json({
        message:'user registered successfully',
        data: savedData,
        error: false,
        success:true
    })
  } catch(error) {
      return res.status(500).json({
        message:`${error} || ${error.message}`,
        error: true,
        success: false
    })
  }
};

export const loginController = async (req,res)=>{
    try {
        const {email,passwordHash} = req.body
        if(!email || !passwordHash){
            return res.status(401).json({
                message:'please provide all field',
                error:true,
                success:false
            })
        }
        const isEmailInDb= await UserModel.findOne({email:email})
        if(!isEmailInDb){
            return res.status(401).json({
                message:'please register to login',
                error:true,
                success:false
            })
        }
        const isPasswordCorrect= await bcrypt.compare(passwordHash,isEmailInDb.passwordHash)
        if(!isPasswordCorrect){
            return res.status(401).json({
                message:'please give correct password',
                error:true,
                success:false
            })
        }

        const token = await jwt.sign({userId: isEmailInDb._id},process.env.SECRET_KEY)
        res.cookie('token',token,{
            expiresIn:'7d'
        })

        return res.json({
            message: `Logged in successfull`,
            error: false,
            data : token,
            success: true,
            userDetail : isEmailInDb
        })
    } catch(error) {
        return res.status(500).json({
          message:`${error} || ${error.message}`,
          error: true,
          success: false
      })
    }
}

export const logoutController = async (req,res) =>{
    try {
        const loggedInUser=req.user
        res.clearCookie("token")

        return res.status(200).json({
            message : `${loggedInUser.name} is logged out`,
            error : false,
            success : true
        })
    } catch (error) {
        return res.status(500).json({
            message:`${error} || ${error.message}`,
            error: true,
            success: false
        })
    }
}

export const getLoggedInUserDetail = async(req,res)=>{
    try {
        const loggedInUser = req.user
        const isUserInDb= await UserModel.findById(loggedInUser._id)
        if(!isUserInDb){
            return res.status(400).json({
                message:'user details not found',
                data: isUserInDb,
                success: false,
                error: true
            })
        }
        return res.status(200).json({
            message:'user details fetched successfully',
                data: isUserInDb,
                success: false,
                error: true
        })
    } catch (error) {
        return res.status(500).json({
            message:`${error} || ${error.message}`,
            error: true,
            success: false
        })
    }
}
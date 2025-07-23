import jwt from 'jsonwebtoken'
import UserModel from '../model/User.js'

const userAuth=async(req,res,next)=>{
   try {
     const accessToken = req.cookies.token

     if(!accessToken){
        return res.status(401).json({
            message:'Please log in',
            error:true,
            success:false
        })
     }
     
     const decodedData = await jwt.verify(accessToken,process.env.SECRET_KEY)
    
     const {userId}= decodedData
    //  console.log(decodedData)

     const user = await UserModel.findById(userId)

     req.user=user

     next()

   } catch (error) {
    res.status(500).json({
        message : error.message || error,
        success : false,
        error : true
    })
   }
}

export default userAuth
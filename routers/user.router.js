import express from 'express'
import { getLoggedInUserDetail, loginController, logoutController, registerController } from '../controller/user.controller.js'
import userAuth from '../middleware/userAuth.js'

const userRouter = express.Router()

userRouter.post('/register',registerController)
userRouter.post('/login',loginController)
userRouter.post('/logout',userAuth,logoutController)
userRouter.get('/getUserDetails',userAuth,getLoggedInUserDetail)

export default userRouter
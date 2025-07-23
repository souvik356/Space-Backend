import express from 'express'
import connectDb from '../Database/Database.js'
import dotenv from 'dotenv'
import userRouter from '../routers/user.router.js'
import cookieParser from 'cookie-parser'
import spaceRouter from '../routers/space.router.js'
import projectRouter from '../routers/project.router.js'
dotenv.config()

const app = express()

app.use(cors({
    origin: 'http://localhost:3000', 
    credentials: true,
}))

app.use(cookieParser())
app.use(express.json())

app.use('/api/user',userRouter)
app.use('/api/spaces',spaceRouter)
app.use('/api/project',projectRouter)

connectDb().then(()=>{
    console.log('Database connected successfully')
    app.listen(process.env.PORT_NUMBER,()=>{
       console.log(`server is connected to port number ${process.env.PORT_NUMBER}`)
    })
})
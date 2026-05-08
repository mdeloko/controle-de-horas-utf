import { Router,type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";


const userRouter = Router();

//Sign Up
userRouter.post('/signup',(req:Request,res:Response)=>{
    res.status(StatusCodes.BAD_REQUEST)
})

export default userRouter
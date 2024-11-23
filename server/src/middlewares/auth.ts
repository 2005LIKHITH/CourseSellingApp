import {Request,Response,NextFunction} from 'express';
import jwt from 'jsonwebtoken'
import {STATUS_CODES} from '../constants';
import {User} from '../models/user.model';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { Course } from '../models/course.model';


export const verifyToken = asyncHandler(
    async (req: Request, _: Response, next: NextFunction) => {
        

      try {
        console.log("Hello")
        // console.log("Headers:", req.headers);
        console.log("Token:", req.headers.authorization);
        console.log("Cookies:", req.signedCookies);

        const token: string =
          req.signedCookies.accessToken ||
          req.header('Authorization')?.replace('Bearer ', '');
        console.log(token);
        if (!token) {
          throw new ApiError(STATUS_CODES.UNAUTHORIZED, 'Unauthorized request');
        }
        console.log(token);
        const decodedPayload = jwt.verify(
          token,
          process.env.ACCESS_TOKEN_SECRET as string
        );
        console.log(decodedPayload);
  
        const user = await User.findById(
          typeof decodedPayload !== 'string' && decodedPayload.id
        );
  
        if (!user) {
          throw new ApiError(STATUS_CODES.UNAUTHORIZED, 'Unauthorized request');
        }
  
        req.user = user;
        next();
      } catch (error) {
        throw new ApiError(
          STATUS_CODES.UNAUTHORIZED,
          error instanceof Error ? error.message : 'Invalid token'
        );
      }
    }
  );
export const verifyAdmin = asyncHandler(async(req:Request,_:Response,next:NextFunction)=>{
    try{
        if(req.user?.role !== 'admin') throw new ApiError(STATUS_CODES.FORBIDDEN,'Forbidden');
        next();
    }catch(error){
        throw new ApiError(STATUS_CODES.FORBIDDEN,'Forbidden',error instanceof Error ? [error.message] : null);
    }
})
export const verifyUserPurchased = asyncHandler(async(req:Request,_:Response,next:NextFunction)=>{
    try{
        if(req.user?.role !== 'user') throw new ApiError(STATUS_CODES.FORBIDDEN,'Forbidden');
        const course = await Course.findById(req.params.id);
        if(!course) throw new ApiError(STATUS_CODES.NOT_FOUND,'Course not found');
        if(!(req.user.coursesAccess.includes(course._id))) throw new ApiError(STATUS_CODES.FORBIDDEN,'Forbidden');
    }catch(error){
        throw new ApiError(STATUS_CODES.FORBIDDEN,'Forbidden',error instanceof Error ? [error.message] : null);
    }
})



export const verifyEducatorAccess = asyncHandler(async(req:Request,_:Response,next:NextFunction)=>{
    try{
        console.log(req.user?.role)
        if(req.user?.role !== 'educator') throw new ApiError(STATUS_CODES.FORBIDDEN,'Forbidden');
        const course = await Course.findById(req.params.id);
        
        
        if(!course) throw new ApiError(STATUS_CODES.NOT_FOUND,'Course not found');
        if(!(req.user.coursesAccess.includes(course._id))) throw new ApiError(STATUS_CODES.FORBIDDEN,'Forbidden');
        next();
    }catch(error){
        throw new ApiError(STATUS_CODES.FORBIDDEN,'Forbidden',error instanceof Error ? [error.message] : null);
    }
})

export const verifyEducatorAccessCreation = asyncHandler(async(req:Request,_:Response,next:NextFunction)=>{
    try{
        if(req.user?.role !== 'educator') throw new ApiError(STATUS_CODES.FORBIDDEN,'Forbidden');
        next();
    }catch(error){
        throw new ApiError(STATUS_CODES.FORBIDDEN,'Forbidden',error instanceof Error ? [error.message] : null);
    }
})



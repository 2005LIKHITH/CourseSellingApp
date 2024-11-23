import { Request, Response } from 'express';
import { STATUS_CODES, cookieOptions } from '../constants';
import { User } from '../models/user.model';
import { TUserFiles, IUserDocument } from '../types';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { uploadFileToCloudinary } from '../utils/cloudinary';
import jwt from 'jsonwebtoken';
import { Course, ICourse } from '../models/course.model';
import { Video, IVideo } from '../models/video.model';
import mongoose, { ObjectId, Types } from 'mongoose';
type RefreshAndAccessToken = (
  user: IUserDocument
) => Promise<{ refreshToken: string; accessToken: string }>;

const generateRefreshAndAccessToken: RefreshAndAccessToken = async user => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;

  await user.save({ validateBeforeSave: false });

  return { refreshToken, accessToken };
};
const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { username, email, password, fullName,role } = req.body;
  const userDetails = [username, email, password, fullName];

  if (!userDetails.every(Boolean)) {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, 'All fields are required');
  }

  const userExist = await User.findOne({ $or: [{ username }, { email }] });
  if (userExist) {
    throw new ApiError(
      STATUS_CODES.BAD_REQUEST,
      'Username or email already exists'
    );
  }

  let avatarUrl: string | undefined;
  const avatarLocalPath = (<TUserFiles>req.files)?.avatar?.[0]?.path;
  if (avatarLocalPath) {
    const avatar = await uploadFileToCloudinary(avatarLocalPath, {
      folder: 'avatar',
      retries: 1,
    });
    if (!avatar) {
      throw new ApiError(
        STATUS_CODES.BAD_REQUEST,
        'Avatar upload failed. Please try again.'
      );
    }
    avatarUrl = avatar.url;
  }

  const user = await User.create({
    username,
    email,
    password,
    fullName,
    avatar: avatarUrl,
    role
  });

  res.status(STATUS_CODES.CREATED).json(
    new ApiResponse(
      STATUS_CODES.CREATED,
      user,
      'User registered successfully'
    )
  );
});

const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const {username,password,email} = req.body;
  if(!(username || email || password)) throw new ApiError(STATUS_CODES.BAD_REQUEST,'All fields are required');

  if (!(username || email) || !password) {
    throw new ApiError(
      STATUS_CODES.BAD_REQUEST,
      'User Credentials are required'
    );
  }
  const user = await User.findOne({ $or: [{ username }, { email }] }).select(
    '+password'
  );
  if(!user) throw new ApiError(STATUS_CODES.BAD_REQUEST,'User not found');

  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if(!isPasswordCorrect) throw new ApiError(STATUS_CODES.BAD_REQUEST,'Incorrect password');

  const { refreshToken, accessToken } = await generateRefreshAndAccessToken(user);
  res.status(STATUS_CODES.OK).cookie('refreshToken', refreshToken, cookieOptions).cookie('accessToken', accessToken, cookieOptions).json(
    new ApiResponse(
      STATUS_CODES.OK,
      { accessToken },
      'User logged in successfully'
    )
  )


  


  
  
});
const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  console.log("At Logout user")
  await User.findByIdAndUpdate(
    req?.user?._id,
    {
      $unset: { refreshToken: 1 },
    },
    { new: true }
  );

  res
    .status(STATUS_CODES.OK)
    .clearCookie('accessToken', cookieOptions)
    .clearCookie('refreshToken', cookieOptions)
    .json(new ApiResponse(STATUS_CODES.OK, {}, 'Logout successfully'));
});

const generateSession = asyncHandler(async (req: Request, res: Response) => {
  const incomingToken: string =
    req.signedCookies.refreshToken || req.body.refreshToken;

  if (!incomingToken) {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Refresh token not present');
  }
  const decodedPayload = jwt.verify(
    incomingToken,
    process.env.REFRESH_TOKEN_SECRET as string
  );

  const user = await User.findById(
    typeof decodedPayload !== 'string' && decodedPayload.id
  ).select('+refreshToken');

  if (!user) {
    throw new ApiError(STATUS_CODES.UNAUTHORIZED, 'Invalid refresh token');
  }

  if (incomingToken !== user.refreshToken) {
    throw new ApiError(
      STATUS_CODES.UNAUTHORIZED,
      'Refresh token expired or used'
    );
  }

  const { refreshToken, accessToken } =
    await generateRefreshAndAccessToken(user);

  res
    .status(STATUS_CODES.OK)
    .cookie('accessToken', accessToken, cookieOptions)
    .cookie('refreshToken', refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        STATUS_CODES.OK,
        {
          user: {
            ...user.toObject(),
            refreshToken: undefined,
          },
          accessToken,
          refreshToken,
        },
        'Session refreshed successfully'
      )
    );
});
const getUserProfile = asyncHandler(async (req: Request, res: Response) => {
  console.log("At get User Profile")
  res.status(STATUS_CODES.OK).json(new ApiResponse(STATUS_CODES.OK, req.user));
})
const createCourse = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(STATUS_CODES.UNAUTHORIZED, 'Unauthorized request');
  // if (req.user.role !== 'educator') throw new ApiError(STATUS_CODES.FORBIDDEN, 'Forbidden');

  const { title, coverImage, description, price, category } = req.body;

  if (!title || !description || !price || !category) {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Missing required fields');
  }

  const validCategories = ['Web Development', 'Web 3', 'Devops'];
  if (!validCategories.includes(category)) {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, `Invalid category. Allowed values: ${validCategories.join(', ')}`);
  }

  const course = await Course.create({
    title,
    coverImage,
    educator: req.user._id,
    student: [],
    description,
    videos: [],
    price,
    category,
  });

  res.status(STATUS_CODES.CREATED).json(new ApiResponse(STATUS_CODES.CREATED, course));
});

const createVideo = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(STATUS_CODES.UNAUTHORIZED, 'Unauthorized request');
  // if (req.user.role !== 'educator') throw new ApiError(STATUS_CODES.FORBIDDEN, 'Forbidden');

  const { videoFile, thumbnail, courseId } = req.body;

  if (!videoFile || !courseId) {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Missing required fields: videoFile or courseId');
  }

  const course = await Course.findById(courseId);
  if (!course) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Course not found');
  }
  if (course.educator.toString() !== req.user._id.toString()) {
    throw new ApiError(STATUS_CODES.FORBIDDEN, 'You are not authorized to add videos to this course');
  }

  const video = await Video.create({
    videoFile,
    thumbnail,
    course: course._id,
    educator: req.user._id,
    viewersWatched: [],
  });

  course.videos.push(video._id);
  await course.save();

  res.status(STATUS_CODES.CREATED).json(new ApiResponse(STATUS_CODES.CREATED, video));
});

const accessCourse = asyncHandler(async (req: Request, res: Response) => {
  if(!req.user) throw new ApiError(STATUS_CODES.UNAUTHORIZED, 'Unauthorized request');
  if(req.user.role == 'admin'){
    const courseInfo = await Course.findById(req.params.id);
    if(!courseInfo) throw new ApiError(STATUS_CODES.NOT_FOUND, 'Course not found');
    return res.status(STATUS_CODES.OK).json(new ApiResponse(STATUS_CODES.OK, courseInfo));
  }
  else if(req.user.role == 'educator'){
    const courseInfo = await Course.findById(req.params.id);
    if(!courseInfo) throw new ApiError(STATUS_CODES.NOT_FOUND, 'Course not found');
    if(req.user.coursesAccess.includes(courseInfo._id)){
      return res.status(STATUS_CODES.OK).json(new ApiResponse(STATUS_CODES.OK, courseInfo));
    }
    else{
      throw new ApiError(STATUS_CODES.FORBIDDEN, 'Forbidden');
    }
  }
  else if(req.user.role == 'user'){
    const courseInfo = await Course.findById(req.params.id);
    if(!courseInfo) throw new ApiError(STATUS_CODES.NOT_FOUND, 'Course not found');
    if(req.user.coursesAccess.includes(courseInfo._id)){
      return res.status(STATUS_CODES.OK).json(new ApiResponse(STATUS_CODES.OK, courseInfo));
    }
    else{
      throw new ApiError(STATUS_CODES.FORBIDDEN, 'Forbidden');
    }
  }
})
const uploadVideo = asyncHandler(async (req: Request, res: Response) => {
  if(!req.user) throw new ApiError(STATUS_CODES.UNAUTHORIZED, 'Unauthorized request');
  if(req.user.role !== 'educator') throw new ApiError(STATUS_CODES.FORBIDDEN, 'Forbidden');
  if(!req.user.coursesAccess.includes(new mongoose.Types.ObjectId(req.params.id))) throw new ApiError(STATUS_CODES.FORBIDDEN, 'Forbidden');

  const { videoFile, thumbnail } = req.body;
  if (!videoFile || !thumbnail) {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Missing required fields');
  }
  const video = await Video.create({
    videoFile,
    thumbnail,
    course: req.params.id,
    educator: req.user._id,
    viewersWatched: [],
  });
  res.status(STATUS_CODES.CREATED).json(new ApiResponse(STATUS_CODES.CREATED, video));
})
    
  

export { registerUser , loginUser, logoutUser, generateSession, getUserProfile
   , createCourse, createVideo,accessCourse,uploadVideo};

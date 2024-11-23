import { UploadApiOptions, UploadApiResponse } from 'cloudinary';
import { Document, Types } from 'mongoose';
import { Response } from 'express'

export type userRole = 'admin' | 'educator' | 'user';

declare module 'express' {
  interface Request {
    user?: IUserDocument;
  }
}

declare module 'jsonwebtoken' {
  interface JwtPayload {
    id: string;
    email?: string;
    username?: string;
    role?: string;
  }
}

export type Folder = 'thumbnail' | 'avatar' | 'cover' | 'videos' | 'post';

export interface CustomUploadApiOptions extends UploadApiOptions {
  folder?: Folder;
  retries?: number;
}

export type UploadFileType = (
  localFilePath: string | undefined,
  options?: CustomUploadApiOptions
) => Promise<UploadApiResponse | null>;

export type TUserFiles =
  | {
      avatar?: Express.Multer.File[];
      coverImage?: Express.Multer.File[];
    }
  | undefined;

export interface IUser {
  username: string;
  email: string;
  password: string;
  fullName: string;
  avatar?: string;
  refreshToken: string;
  watchHistory: Types.ObjectId[];
  coursesAccess:Types.ObjectId[];
  role: userRole;

}

export interface IUserMethods {
  isPasswordCorrect: (password: IUser['password']) => Promise<boolean>;
  generateAccessToken: () => string;
  generateRefreshToken: () => string;
}

export type IUserDocument = Document<unknown, object, IUser> &
  Omit<
    IUser & {
      _id: Types.ObjectId;
    },
    keyof IUserMethods
  > &
  IUserMethods;
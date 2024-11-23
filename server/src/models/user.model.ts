import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'
import {Model,model,Schema, Types} from 'mongoose';
import {IUser,IUserMethods,userRole} from '../types/index'
import dotenv from 'dotenv'
dotenv.config({
    path:'./.env'
});

type IUserModel = Model<IUser,object,IUserMethods>
const userSchema = new Schema<IUser,IUserModel,IUserMethods>({
    username:{
        type:String,
        unique:true,
        required:true,
        lowercase:true,
        trim:true,
        index:true

    },
    email:{
        type:String,
        unique:true,
        required:true,
        lowercase:true,
        trim:true
    },
    password:{
        type:String,
        required:true,
        trim:true,
        select:false
    },
    fullName:{
        type:String,
        required:true,
        trim:true
    },
    avatar:{
        type:String,
        // required:true
    },
    watchHistory:[{
        type:Types.ObjectId,
        ref:'Video'
    }],
    refreshToken:{
        type:String,
        select:false
    },
    coursesAccess:{
        type:[Types.ObjectId],
        ref:'Course',
        default:[],
        index:true
    },
    role:{
        type:String,
        enum : ['user','admin','educator'],
        default:'user'

    }
},{timestamps:true})

userSchema.pre('save',async function(next){
    if(!this.isModified('password')) return next();
    console.log(this.password)
    this.password = await bcrypt.hash(this.password,10);
    console.log(this.password)
    next();
})
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
      {
        id: this._id,
        email: this.email,
        username: this.username,
      },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
};
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET as string,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    )
};

export const User = model<IUser,IUserModel>('User',userSchema)



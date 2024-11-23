import {Model,model,Schema, Types} from 'mongoose';

export interface ICourse{
    title:string,
    coverImage?:string,
    educator:Types.ObjectId,
    student:Types.ObjectId[],
    description:string,
    videos:Types.ObjectId[],
    price:number,
    category:string
} 
type ICourseModel = Model<ICourse> 
const courseSchema = new Schema({
    title:{
        type:String,
        required:true,
        index:true,
        unique:true
    },
    coverImage:{
        type:String,

    },
    educator:{
        type:Types.ObjectId,
        required:true,
        ref:'User',
        index:true
    },
    student:[{
        type:Types.ObjectId,
        ref:'User',
        default:[]
    }],
    description:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    videos:[{
        type:Types.ObjectId,
        ref:"Video",
        default :[]
    }],
    category:{
        type:String,
        enum:['Web Development','Web 3','Devops'],
        required:true,
        index:true
    },
})

export const Course = model<ICourse,ICourseModel>('Course',courseSchema)
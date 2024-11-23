import { Schema, Types,model,Model} from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

export interface IVideo{
    videoFile:string,
    thumbnail?:string,
    course:Types.ObjectId,
    educator:Types.ObjectId,
    viewersWatched:Types.ObjectId[]
}
type IVideoModel = Model<IVideo>    
const videoSchema = new Schema({
    videoFile :{
        type:String,
        required:true
    },
    thumbnail:{
        type:String
    },
    course:{
        type:Types.ObjectId,
        required:true,
        ref:'Course'
    },
    educator:{
        type:Types.ObjectId,
        required:true,
        ref:'User'
    },
    viewersWatched:[{
        type:Types.ObjectId,
        ref:'User',
        default:[]
    }],
    
},{timestamps:true})

videoSchema.plugin(mongooseAggregatePaginate);
export const Video = model<IVideo,IVideoModel>('Video',videoSchema)
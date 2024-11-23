import {Router} from 'express'
import upload from '../middlewares/multer';
import { verifyToken, verifyEducatorAccess ,verifyEducatorAccessCreation} from '../middlewares/auth';
import { createCourse,createVideo } from '../controllers/user.controller';

const router = Router();

router.route('/create-course').post(verifyToken,verifyEducatorAccessCreation,upload.fields([
    {
        name:"coverImage",
        maxCount:1
    },
    {
        name:"videoFile",
        maxCount:1
    }
]),createCourse);
router.route('/:id/create-video').post(verifyToken,verifyEducatorAccess,upload.fields([
    {
        name:"videoFile",
        maxCount:1
    },
    {
        name:"thumbnail",
        maxCount:1
    }
]),createVideo);        
router.route('/courses/:id').get(verifyToken,verifyEducatorAccess,);

export default router
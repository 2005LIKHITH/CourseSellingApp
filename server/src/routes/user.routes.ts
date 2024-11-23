import {Router} from 'express'

import upload from '../middlewares/multer';
import { verifyToken } from '../middlewares/auth';
import {registerUser,loginUser, logoutUser, getUserProfile} from '../controllers/user.controller';

const router = Router();

router.route('/signup').post(upload.fields([
    {
        name:"avatar",
        maxCount:1
    }
]),registerUser);

router.route('/login').post(loginUser);

router.route('/logout').post(verifyToken,logoutUser);

router.route('/profile').get(verifyToken,getUserProfile);



// router.route('/profile/update').put(verifyToken,upload.fields([
//     {
//         name:"avatar",
//         maxCount:1
//     }
// ]),updateUserProfile);

export default router
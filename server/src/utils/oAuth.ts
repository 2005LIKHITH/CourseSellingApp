import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';
import { log } from 'console';
dotenv.config({ path: './.env' });
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;



if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error("Missing Google OAuth environment variables.");
}


const oAuth2client = new OAuth2Client(
     GOOGLE_CLIENT_ID,
     GOOGLE_CLIENT_SECRET,
     "http://localhost:8000/api/v1/users/OAuth2/google",
  );
  
  export { oAuth2client };
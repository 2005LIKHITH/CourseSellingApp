import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { MAX_JSON_PAYLOAD_SIZE, STATIC_FOLDER_NAME } from './constants';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
export const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);


app.use(express.json({ limit: MAX_JSON_PAYLOAD_SIZE }));
app.use(express.urlencoded({ extended: true, limit: MAX_JSON_PAYLOAD_SIZE }));
app.use(express.static(STATIC_FOLDER_NAME));
console.log(process.env.COOKIE_SECRET);
app.use(cookieParser(process.env.COOKIE_SECRET));


import userRouter from './routes/user.routes';
import educatorRouter from './routes/educator.routes';
app.use('/api/v1/users', userRouter);
app.use('/api/v1/educators', educatorRouter);
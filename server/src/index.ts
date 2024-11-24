import dotenv from 'dotenv';
import connectDB from './db/db';
import { app } from './app';

dotenv.config({ path: './.env' });

const port = process.env.PORT || 8000;
// console.log("At Google Login");


connectDB()
  .then(() => {
    app.on('error', error => {
      throw error;
    });
    app.listen(port, () => {
      console.log(`Server is running at port: ${port}`);
    });
  })
  .catch(error => {
    console.log(`CONNECTION FAILED`, error);
  });
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import { UploadFileType } from '../types';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadFileToCloudinary: UploadFileType = async (
  localFilePath,
  options = {}
) => {
  if (!localFilePath) return null;
  const { retries = 0, ...uploadOptions } = options;

  try {
    const uploadRespone = await cloudinary.uploader.upload(localFilePath, {
      ...uploadOptions,
    });

    return uploadRespone;
  } catch (error) {
    console.log('CLOUDINARY Upload Error ::', error);

    if (retries > 0) {
      console.log(`Retrying upload (${retries}) attempts remaining`);
      return uploadFileToCloudinary(localFilePath, {
        ...options,
        retries: retries - 1,
      });
    }

    return null;
  } finally {
    fs.unlinkSync(localFilePath);
  }
};

export { uploadFileToCloudinary };
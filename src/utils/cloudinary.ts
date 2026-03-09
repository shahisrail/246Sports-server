import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dm6crryf2',
  api_key: process.env.CLOUDINARY_API_KEY || '157947392252212',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'V4g1cdTYVe-kducPzNSdBn0HBfg',
  secure: true,
});

export { cloudinary };

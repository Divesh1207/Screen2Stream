
import cloudinary from 'cloudinary';
import multer from 'multer';
import { Readable } from 'stream';
import Screenshot from '../models/Screenshot.js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const isProduction = process.env.NODE_ENV === 'production';
console.log(`Current environment: ${isProduction ? 'Production' : 'Development'}`);

// Use memory storage for multer
const upload = multer({ storage: multer.memoryStorage() }).single('image');

// Utility to get __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadScreenshot = async (req, res) => {
  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      return res.status(500).json({ message: 'File upload failed', error: err.message });
    } else if (err) {
      console.error('Unknown error:', err);
      return res.status(500).json({ message: 'Server error occurred', error: err.message });
    }

    if (!req.file) {
      console.error('No file uploaded');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('File received:', req.file.originalname);

    try {
      let screenshotId, imageUrl;
      const uniqueId = uuidv4();

      if (isProduction) {
        console.log('Uploading to Cloudinary...');
        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.v2.uploader.upload_stream(
            { folder: 'your-folder-name', allowed_formats: ['jpg', 'png', 'jpeg'] },
            (error, result) => {
              if (error) {
                console.error('Cloudinary upload error:', error);
                reject(error);
              } else {
                console.log('Cloudinary upload successful');
                resolve(result);
              }
            }
          );

          const bufferStream = new Readable();
          bufferStream.push(req.file.buffer);
          bufferStream.push(null);
          bufferStream.pipe(uploadStream);
        });

        screenshotId = `${uniqueId}-${result.public_id}`;
        imageUrl = result.secure_url;
        console.log('Cloudinary upload complete. Screenshot ID:', screenshotId);
      } else {
        console.log('Saving to local storage...');
        // Local storage configuration
        const uploadsDir = path.join(__dirname, '../uploads/');
        if (!fs.existsSync(uploadsDir)) {
          console.log('Creating uploads directory:', uploadsDir);
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        screenshotId = `${uniqueId}-${req.file.originalname}`;
        const filePath = path.join(uploadsDir, screenshotId);
        fs.writeFileSync(filePath, req.file.buffer);
        console.log('File saved locally:', filePath);
        
        imageUrl = `/uploads/${screenshotId}`;
      }

      console.log('Updating database...');
      // Update or create the screenshot document
      const updatedScreenshot = await Screenshot.findOneAndUpdate(
        { screenshotId: screenshotId },
        { 
          screenshotId: screenshotId,
          imageUrl: imageUrl,
        },
        { 
          new: true,
          upsert: true,
          setDefaultsOnInsert: true
        }
      );
      console.log('Database updated. Document:', updatedScreenshot);

      const baseUrl = isProduction ? process.env.PRODUCTION_URL : process.env.DEVELOPMENT_URL;
      const fullImageUrl = isProduction ? updatedScreenshot.imageUrl : `${baseUrl}${updatedScreenshot.imageUrl}`;
      console.log('Full image URL:', fullImageUrl);

      res.status(200).json({
        screenshotId: updatedScreenshot.screenshotId,
        imageUrl: fullImageUrl
      });
      console.log('Response sent to client');

    } catch (error) {
      console.error('Error in uploadScreenshot:', error);
      res.status(500).json({ message: 'Error saving screenshot', error: error.message });
    }
  });
};
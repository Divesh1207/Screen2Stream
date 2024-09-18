// import multer from 'multer';
// import fs from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';

// // Get __dirname equivalent in ES modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Ensure the uploads directory exists
// const uploadsDir = path.join(__dirname, '../uploads/');
// if (!fs.existsSync(uploadsDir)) {
//     fs.mkdirSync(uploadsDir, { recursive: true });
// }

// // Configure multer storage
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, uploadsDir); // Save to the uploads directory
//     },
//     filename: function (req, file, cb) {
//         // Generate a unique filename and replace invalid characters
//         const uniqueSuffix = new Date().toISOString().replace(/:/g, '-') + path.extname(file.originalname);
//         cb(null, uniqueSuffix); // Use a valid filename
//     }
// });

// const upload = multer({ storage: storage }).single('image');

// // File upload controller
// export const uploadScreenshot = (req, res) => {
//     upload(req, res, function (err) {
//         if (err instanceof multer.MulterError) {
//             console.error('Multer error:', err);
//             if (!res.headersSent) {
//                 return res.status(500).json({ message: 'File upload failed' });
//             }
//         } else if (err) {
//             console.error('Unknown error:', err);
//             if (!res.headersSent) {
//                 return res.status(500).json({ message: 'Server error occurred' });
//             }
//         }

//         if (!req.file) {
//             console.error('No file uploaded');
//             if (!res.headersSent) {
//                 return res.status(400).json({ message: 'No file uploaded' });
//             }
//         }

//         // Success
//         if (!res.headersSent) {
//             return res.status(200).json({ message: 'File uploaded successfully', file: req.file });
//         }
//     });
// };



// import Screenshot from '../models/Screenshot.js';
// import multer from 'multer';
// import fs from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';

// // Get __dirname equivalent in ES modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Ensure the uploads directory exists
// const uploadsDir = path.join(__dirname, '../uploads/');
// if (!fs.existsSync(uploadsDir)) {
//     fs.mkdirSync(uploadsDir, { recursive: true });
// }

// // Configure multer storage
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, uploadsDir); // Save to the uploads directory
//     },
//     filename: function (req, file, cb) {
//         // Generate a unique filename and replace invalid characters
//         const uniqueSuffix = new Date().toISOString().replace(/:/g, '-') + path.extname(file.originalname);
//         cb(null, uniqueSuffix); // Use a valid filename
//     }
// });

// const upload = multer({ storage: storage }).single('image');

// // File upload controller
// export const uploadScreenshot = (req, res) => {
//     upload(req, res, async function (err) {
//         if (err instanceof multer.MulterError) {
//             console.error('Multer error:', err);
//             return res.status(500).json({ message: 'File upload failed' });
//         } else if (err) {
//             console.error('Unknown error:', err);
//             return res.status(500).json({ message: 'Server error occurred' });
//         }

//         if (!req.file) {
//             console.error('No file uploaded');
//             return res.status(400).json({ message: 'No file uploaded' });
//         }

//         // Save the uploaded file information to MongoDB
//         try {
//             const imageUrl = path.join('/uploads/', req.file.filename); // Path where image is stored
//             const { userId } = req.body; // Assume userId comes from the request body

//             // Create a new screenshot entry in the database
//             const newScreenshot = new Screenshot({
//                 screenshotId: req.file.filename, // Use the filename as a unique screenshot ID
//                 userId: userId, // User uploading the image
//                 imageUrl: imageUrl, // Store the file path or URL
//             });

//             // Save the screenshot to MongoDB
//             await newScreenshot.save();

//             res.status(200).json({ message: 'File uploaded and saved to database', file: req.file, screenshot: newScreenshot });
//         } catch (dbError) {
//             console.error('Error saving to MongoDB:', dbError);
//             res.status(500).json({ message: 'Error saving to database', error: dbError.message });
//         }
//     });
// };








// import path from 'path';
// import fs from 'fs';
// import multer from 'multer';
// import Screenshot from '../models/Screenshot.js';
// import { preprocessImage } from './preprocessController.js';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const uploadsDir = path.join(__dirname, '../uploads/');
// if (!fs.existsSync(uploadsDir)) {
//     fs.mkdirSync(uploadsDir, { recursive: true });
// }

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, uploadsDir);
//     },
//     filename: function (req, file, cb) {
//         const uniqueSuffix = new Date().toISOString().replace(/:/g, '-') + path.extname(file.originalname);
//         cb(null, uniqueSuffix);
//     }
// });

// const upload = multer({ storage: storage }).single('image');

// export const uploadScreenshot = (req, res) => {
//     upload(req, res, async function (err) {
//         if (err instanceof multer.MulterError) {
//             console.error('Multer error:', err);
//             return res.status(500).json({ message: 'File upload failed', error: err.message });
//         } else if (err) {
//             console.error('Unknown error:', err);
//             return res.status(500).json({ message: 'Server error occurred', error: err.message });
//         }

//         if (!req.file) {
//             console.error('No file uploaded');
//             return res.status(400).json({ message: 'No file uploaded' });
//         }

//         const filePath = path.join(uploadsDir, req.file.filename);
//         console.log('Original file path:', filePath);

//         if (!fs.existsSync(filePath)) {
//             console.error('Uploaded file does not exist at path:', filePath);
//             return res.status(404).json({ message: 'File not found' });
//         }

//         const imageUrl = path.join('/uploads/', req.file.filename);

//         try {
//             const newScreenshot = new Screenshot({
//                 screenshotId: req.file.filename,
//                 imageUrl: imageUrl,
//             });

//             await newScreenshot.save();
// //alg s frontend m /api/preproces call mt kro upload hote hi preproces wala yhi chlega aur data dega
//             const preprocessedImageUrl = await preprocessImage(filePath);
//             //yaha tk code theek chl rha hai image local s download ho jaa rha hai 
//             //aur ek preprocessed image url de rha hai 
//             console.log('Preprocessed image URL in the backend in the uploadcontroller file:', preprocessedImageUrl);

//             const baseUrl = process.env.NODE_ENV === 'production'
//                 ? 'https://yourdomain.com'
//                 : 'http://localhost:5000';

//             res.status(200).json({
//                 screenshotId: req.file.filename,
//                 preprocessedImageUrl: `${baseUrl}${preprocessedImageUrl}`
//             });
//         } catch (preprocessError) {
//             console.error('Error preprocessing image:', preprocessError.message);
//             res.status(500).json({ message: 'Error preprocessing image', error: preprocessError.message });
//         }
//     });
// };



// import path from 'path';
// import fs from 'fs';
// import multer from 'multer';
// import Screenshot from '../models/Screenshot.js';
// import { fileURLToPath } from 'url';
// import dotenv from 'dotenv';
// dotenv.config();
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const uploadsDir = path.join(__dirname, '../uploads/');
// if (!fs.existsSync(uploadsDir)) {
//     fs.mkdirSync(uploadsDir, { recursive: true });
// }

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, uploadsDir);
//     },
//     filename: function (req, file, cb) {
//         const uniqueSuffix = new Date().toISOString().replace(/:/g, '-') + path.extname(file.originalname);
//         cb(null, uniqueSuffix);
//     }
// });

// const upload = multer({ storage: storage }).single('image');

// export const uploadScreenshot = (req, res) => {
//     upload(req, res, async function (err) {
//         if (err instanceof multer.MulterError) {
//             console.error('Multer error:', err);
//             return res.status(500).json({ message: 'File upload failed', error: err.message });
//         } else if (err) {
//             console.error('Unknown error:', err);
//             return res.status(500).json({ message: 'Server error occurred', error: err.message });
//         }

//         if (!req.file) {
//             console.error('No file uploaded');
//             return res.status(400).json({ message: 'No file uploaded' });
//         }

//         const filePath = path.join(uploadsDir, req.file.filename);
//         console.log('Original file path:', filePath);

//         if (!fs.existsSync(filePath)) {
//             console.error('Uploaded file does not exist at path:', filePath);
//             return res.status(404).json({ message: 'File not found' });
//         }

//         const imageUrl = path.join('/uploads/', req.file.filename);

//         try {
//             const newScreenshot = new Screenshot({
//                 screenshotId: req.file.filename,
//                 imageUrl: imageUrl,
//             });

//             await newScreenshot.save();

//             const baseUrl = process.env.NODE_ENV === 'production'
//             ? process.env.PRODUCTION_URL
//             : process.env.DEVELOPMENT_URL;
        

//             res.status(200).json({
//                 screenshotId: req.file.filename,
//                 imageUrl: `${baseUrl}${imageUrl}` // Provide the URL of the original image
//             });
//         } catch (saveError) {
//             console.error('Error saving screenshot:', saveError.message);
//             res.status(500).json({ message: 'Error saving screenshot', error: saveError.message });
//         }
//     });
// };









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
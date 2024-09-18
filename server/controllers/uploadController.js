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



import path from 'path';
import fs from 'fs';
import multer from 'multer';
import Screenshot from '../models/Screenshot.js';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, '../uploads/');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = new Date().toISOString().replace(/:/g, '-') + path.extname(file.originalname);
        cb(null, uniqueSuffix);
    }
});

const upload = multer({ storage: storage }).single('image');

export const uploadScreenshot = (req, res) => {
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

        const filePath = path.join(uploadsDir, req.file.filename);
        console.log('Original file path:', filePath);

        if (!fs.existsSync(filePath)) {
            console.error('Uploaded file does not exist at path:', filePath);
            return res.status(404).json({ message: 'File not found' });
        }

        const imageUrl = path.join('/uploads/', req.file.filename);

        try {
            const newScreenshot = new Screenshot({
                screenshotId: req.file.filename,
                imageUrl: imageUrl,
            });

            await newScreenshot.save();

            const baseUrl = process.env.NODE_ENV === 'production'
            ? process.env.PRODUCTION_URL
            : process.env.DEVELOPMENT_URL;
        

            res.status(200).json({
                screenshotId: req.file.filename,
                imageUrl: `${baseUrl}${imageUrl}` // Provide the URL of the original image
            });
        } catch (saveError) {
            console.error('Error saving screenshot:', saveError.message);
            res.status(500).json({ message: 'Error saving screenshot', error: saveError.message });
        }
    });
};

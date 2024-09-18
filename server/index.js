import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors'; // Import cors package
import { connectToDB } from './db/connection.js';
import router from './routes/Allroutes.js';
import { authenticateToken } from './middleware/authMiddleware.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';


import dotenv from 'dotenv';
dotenv.config();

connectToDB();
const app = express();
const PORT = process.env.PORT || 5000;

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// CORS Configuration
const corsOptions = {
    origin: process.env.ORIGIN_URL, // Allow requests from this URL
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow these HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow these headers
};

// Middleware
app.use(cors(corsOptions)); // Apply CORS middleware with specified options
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(join(__dirname, 'uploads')));

app.use('/api', router);
app.use(errorHandler);

app.get('/test', (req, res) => {
    res.send('Server is running');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

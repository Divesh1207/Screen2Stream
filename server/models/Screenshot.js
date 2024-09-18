
// models/Screenshot.js
import mongoose from 'mongoose';

const screenshotSchema = new mongoose.Schema({
   
        screenshotId: {
          type: String,
          unique: true,  // Ensure uniqueness
          required: true, // Ensure it's always present
          default: () => new Date().toISOString() // or use a UUID generator
        },
        
    imageUrl: {
        type: String,
        required: true
    },
    preprocessedImageUrl: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now, // Automatically set the creation date
        expires: 18000 // Set TTL for 5 hours (in seconds)
    }
});

const Screenshot = mongoose.model('Screenshot', screenshotSchema);
export default Screenshot;

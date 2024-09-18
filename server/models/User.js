import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    uploadedScreenshots: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Screenshot' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
},{ timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;

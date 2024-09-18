// // controllers/authController.js
// import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';
// import User from '../models/User.js'; // Import the User model (you should have this schema ready)

// // Signup Controller
// export const signup = async (req, res) => {
//     const { username, email, password } = req.body;

//     try {
//         // Check if the user already exists
//         const existingUser = await User.findOne({ email });
//         if (existingUser) return res.status(400).json({ message: "User already exists" });

//         // Hash the password
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // Create a new user
//         const newUser = new User({
//             username,
//             email,
//             password: hashedPassword,
//         });

//         // Save user to the database
//         await newUser.save();

//         // Generate JWT token
//         const token = jwt.sign(
//             { userId: newUser._id, username: newUser.username },
//             process.env.JWT_SECRET,
//             { expiresIn: '1h' }
//         );

//         // Respond with the token
//         res.status(201).json({ token, user: { username: newUser.username, email: newUser.email } });
//     } catch (error) {
//         res.status(500).json({ message: "Error in Signup", error });
//     }
// };

// // Login Controller
// export const login = async (req, res) => {
//     const { email, password } = req.body;

//     try {
//         // Find user by email
//         const user = await User.findOne({ email });
//         if (!user) return res.status(400).json({ message: "User not found" });

//         // Compare passwords
//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

//         // Generate JWT token
//         const token = jwt.sign(
//             { userId: user._id, username: user.username },
//             process.env.JWT_SECRET,
//             { expiresIn: '1h' }
//         );

//         // Respond with the token
//         res.status(200).json({ token, user: { username: user.username, email: user.email } });
//     } catch (error) {
//         res.status(500).json({ message: "Error in Login", error });
//     }
// };



import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Utility functions for creating tokens
const createAccessToken = (user) => {
    return jwt.sign(
        { userId: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }  // Access token expires in 15 minutes
    );
};

const createRefreshToken = (user) => {
    return jwt.sign(
        { userId: user._id, username: user.username },
        process.env.JWT_REFRESH_SECRET,  // Separate secret for refresh token
        { expiresIn: '7d' }  // Refresh token expires in 7 days
    );
};

// Signup Controller
export const signup = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        });

        // Save the user in the database
        await newUser.save();

        // Generate tokens
        const accessToken = createAccessToken(newUser);
        const refreshToken = createRefreshToken(newUser);

        // Send refresh token as HTTP-only cookie (secure)
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,  // Use HTTPS in production
            sameSite: 'strict',
            path: '/api/refresh_token'
        });

        // Respond with access token and user info
        res.status(201).json({
            accessToken,
            user: {
                username: newUser.username,
                email: newUser.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error in Signup", error });
    }
};

// Login Controller
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        // Generate tokens
        const accessToken = createAccessToken(user);
        const refreshToken = createRefreshToken(user);

        // Send refresh token as HTTP-only cookie (secure)
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,  // Use HTTPS in production
            sameSite: 'strict',
            path: '/api/refresh_token'
        });

        // Respond with access token and user info
        res.status(200).json({
            accessToken,
            user: {
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error in Login", error });
    }
};

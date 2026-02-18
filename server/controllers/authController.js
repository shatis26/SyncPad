const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Generate a signed JWT for the given user ID.
 * Token expires in 7 days.
 */
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

/**
 * POST /api/auth/signup
 * Register a new user and return a JWT.
 */
exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res
                .status(400)
                .json({ message: "Please provide name, email, and password" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res
                .status(400)
                .json({ message: "An account with this email already exists" });
        }

        // Create user (password is hashed via pre-save hook)
        const user = await User.create({ name, email, password });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * POST /api/auth/login
 * Authenticate user and return a JWT.
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res
                .status(400)
                .json({ message: "Please provide email and password" });
        }

        // Find user and explicitly select the password field
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Compare passwords
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * GET /api/auth/me
 * Return the currently authenticated user's info.
 */
exports.getMe = async (req, res) => {
    try {
        res.json({
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

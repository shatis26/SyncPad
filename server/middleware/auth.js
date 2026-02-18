const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Express middleware that verifies the JWT from the Authorization header.
 * Attaches the decoded user object to req.user on success.
 */
const protect = async (req, res, next) => {
    try {
        let token;

        // Extract token from "Bearer <token>" header
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res
                .status(401)
                .json({ message: "Not authorized – no token provided" });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user (without password) to request
        const user = await User.findById(decoded.id);
        if (!user) {
            return res
                .status(401)
                .json({ message: "Not authorized – user not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        return res
            .status(401)
            .json({ message: "Not authorized – token invalid or expired" });
    }
};

module.exports = protect;

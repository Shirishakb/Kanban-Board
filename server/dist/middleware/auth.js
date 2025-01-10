import jwt from "jsonwebtoken";
export const authenticateToken = (req, res, next) => {
    // Get the token from the Authorization header
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        // If no token is found, respond with an unauthorized status
        return res.status(401).json({ message: "Access denied. No token provided." });
    }
    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            // If token verification fails, respond with a forbidden status
            return res.status(403).json({ message: "Invalid token." });
        }
        if (decoded) {
            // Attach the decoded user data to the request object
            req.user = decoded;
        }
        // Proceed to the next middleware or route handler
        return next();
    });
};

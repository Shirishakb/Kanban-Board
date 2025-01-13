import { Router } from "express";
import { User } from "../models/index.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const login = async (req, res) => {
    const { username, password } = req.body;
    try {
        // Check if the user exists in the database
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(400).json({ message: "Invalid username or password." });
        }
        // Compare the provided password with the hashed password in the database
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid username or password." });
        }
        // Create a JWT token
        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET_KEY, { expiresIn: "1h" } // Token expires in 1 hour
        );
        // Send the token in the response
        return res.json({ token });
    }
    catch (error) {
        console.error("Error logging in:", error);
        return res.status(500).json({ message: "An error occurred. Please try again later." });
    }
};
const router = Router();
// POST /login - Login a user
router.post("/login", login);
export default router;

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  username: string;
}

export const authenticateToken = (req:Request, res: Response, next: NextFunction) => {
  // Get the token from the Authorization header
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    // If no token is found, respond with an unauthorized status
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
    if (err) {
      // If token verification fails, respond with a forbidden status
      return res.status(403).json({ message: "Invalid token." });
    }

    if (decoded) {
      // Attach the decoded user data to the request object
      (req as any).user = decoded as JwtPayload;
    }

    // Proceed to the next middleware or route handler
    return next();
  });
};

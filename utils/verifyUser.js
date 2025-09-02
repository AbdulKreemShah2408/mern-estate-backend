import jwt from "jsonwebtoken";
import errorHandler from "../utils/error.js";

export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(errorHandler(401, "Unauthorized: No token provided"));
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; 
    next();
  } catch (error) {
    return next(errorHandler(401, "Unauthorized: Invalid token"));
  }
};

import jwt from "jsonwebtoken";
import { catchAsyncErrors } from "./catchAsyncError.js";
import ErrorHandler from "./errorMiddleware.js";
import database from "../database/db.js";

export const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  let token = req.cookies?.token;

  // Fallback to Bearer token in Authorization header (crucial for Safari, iOS, and cross-domain third-party cookie restrictions)
  if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Fallback to custom x-access-token header
  if (!token && req.headers["x-access-token"]) {
    token = req.headers["x-access-token"];
  }

  if (!token) {
    return next(new ErrorHandler("Please login to access this resource.", 401));
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY || "your_jwt_secret_key"
    );

    const user = await database.query(
      "SELECT * FROM users WHERE id = $1 LIMIT 1",
      [decoded.id]
    );

    if (!user.rows || user.rows.length === 0) {
      return next(new ErrorHandler("User not found or session expired.", 401));
    }

    req.user = user.rows[0];
    next();
  } catch (error) {
    return next(new ErrorHandler("Please login to access this resource.", 401));
  }
});

export const authorizedRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Role: ${req.user.role} is not allowed to access this resource.`,
          403
        )
      );
    }
    next();
  };
};


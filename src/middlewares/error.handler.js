import ApiError from "../utils/apiError.js";

export const errorHandler = (err, req, res, next) => {
  // If the thrown error is our ApiError, use its values; otherwise default.
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const errors = err.errors || [];

  // In dev you might want to send stack, in prod don't.
  const stack = process.env.NODE_ENV === "production" ? undefined : err.stack;

  return res.status(statusCode).json({
    success: false,
    message,
    errors,
    stack,
  });
};

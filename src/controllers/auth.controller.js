import validator from "validator";
import { User } from "../models/user.model.js";
import ApiError from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwt.js";


export const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  //  1. Validate required fields
  if (!username || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }
  if (!validator.isEmail(email)) {
  throw new ApiError(400, "Email format is invalid");
}

if (!validator.isLength(password, { min: 6 })) {
  throw new ApiError(400, "Password must be at least 6 characters long");
}

if (!validator.isLength(username, { min: 3 })) {
  throw new ApiError(400, "Username must be at least 3 characters long");
}


  //  2. Check if user already exists
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(400, "User already exists with this email");
  }

  //  3. Create user (password hashed automatically in model)
  const user = await User.create({ username, email, password });

  //  4. Remove password before sending response
  user.password = undefined;

  //  5. Return API response
  return res
    .status(201)
    .json(new ApiResponse(201, user, "User registered successfully"));
});
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  //  1. Check fields
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }
  if (!validator.isEmail(email)) {
  throw new ApiError(400, "Invalid email format");
}


  //  2. Find user
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new ApiError(400, "User does not exist");
  }

  //  3. Compare password
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw new ApiError(401, "Invalid password");
  }

  //  4. Generate Tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  //  5. Set Refresh Token as httpOnly cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,            // true in production (HTTPS)
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days
  });

  //  6. Remove password before response
  user.password = undefined;

  //  7. Success Response
  return res.status(200).json(
    new ApiResponse(200, {
      user,
      accessToken,
    }, "Login successful")
  );
});
export const getMyProfile = asyncHandler(async (req, res) => {

  // req.user is set in verifyJWT middleware
  const user = req.user;

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User profile fetched successfully"));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    throw new ApiError(401, "Refresh token missing");
  }

  //  Verify refresh token
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  //  Fetch user
  const user = await User.findById(decoded.userId);
  if (!user) {
    throw new ApiError(401, "User not found");
  }

  //  Generate new access token
  const newAccessToken = generateAccessToken(user._id);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { accessToken: newAccessToken },
        "Access token refreshed"
      )
    );
});

export const logoutUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(new ApiResponse(200, null, "Logged out successfully"));
});
 export const getAllUsersAdmin = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password -refreshToken");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        users,
        "Admin: All users fetched successfully"
      )
    );
});
export const updateProfile = asyncHandler(async (req, res) => {
  const { username, email } = req.body;

  //  At least one field must be provided
  if (!username && !email) {
    throw new ApiError(400, "Please provide username or email to update");
  }

  //  Find logged-in user (verifyJWT already sets req.user)
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  //  Update fields if provided
  if (username) user.username = username;
  if (email) user.email = email;

  //  Save updated user
  await user.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        username: user.username,
        email: user.email,
      },
      "Profile updated successfully"
    )
  );
});
export const updatePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  //  Check inputs
  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Old and new passwords are required");
  }

  //  Find logged-in user
  const user = await User.findById(req.user._id).select("+password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  //  Compare old password
  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) {
    throw new ApiError(400, "Old password is incorrect");
  }

  //  Update to new password
  user.password = newPassword;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Password updated successfully"));
});








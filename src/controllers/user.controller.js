import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"; // Fixed import path
import { User } from "../models/user.models.js"; // Assuming you have a User model defined
import { uploadOnCloudinary } from "../utils/cloudinary.js"; // Assuming you have a cloudinary utility for file uploads
import { ApiResponse } from "../utils/ApiResponse.js";



// generate access and refresh token
const generateAccessAndRefreshToken = async (userId) => {
  try{
    const user = await User.findById(userId);
    
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Save the refresh token in the user document
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false }); // Skip validation for refreshToken field

    return { accessToken, refreshToken };

  }catch(error) {
    throw new ApiError(500, 'Error generating access and refresh tokens'); 
  }
  
}

const registerUser = asyncHandler(async (req, res) => {
  // Registration logic here

  //get user details from request body
  const { fullname, email, username, password } = req.body;
  console.log(fullname, email, username, password);

  // console.log("req files==",req.files);

  //validate user details
  if ([fullname, email, username, password].some((field) => field?.trim() === '')) {
    throw new ApiError(400, 'All fields are required');

  }

  //check if user already exists
  const existedUser = await User.findOne({ $or: [{ email }, { username }] });

  if (existedUser) {
    throw new ApiError(409, 'User with username or email already exists');
  }

  //file uploads
  // console.log(req.files);
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  // let coverImageLocalPath = req.files?.coverImage?.[0]?.path; // Safe access if coverImage is optional
  // console.log(coverImageLocalPath);

  let coverImageLocalPath;

  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path; // Access the first file in the array
  } else {
    coverImageLocalPath = null; // Set to null if not provided
  }   


  if(!avatarLocalPath) {
    throw new ApiError(400, 'Avatar is required');
  }

  //upload on cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);

  // const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  let coverImage = null;
  if (coverImageLocalPath) {
    coverImage = await uploadOnCloudinary(coverImageLocalPath);
  }

  if(!avatar) {
    throw new ApiError(400, 'Avatar file is required');
  }

  //create user and entry in database
  const user = await User.create({
    fullname,
    avatar: avatar.url, // Assuming the uploadOnCloudinary function returns an object with a url property
    coverImage: coverImage ? coverImage.url : null, // Optional cover image
    email,
    username: username.toLowerCase(),
    password,
  });

  //send response
  // Exclude sensitive fields from the response
  // Use findById to get the user without password and refreshToken
 const createdUser = await User.findById(user._id).select('-password -refreshToken'); // Exclude sensitive fields from the response

  if(!createdUser) {
    throw new ApiError(500, 'User creation failed');
  }

  return res.status(201).json(
    new ApiResponse(201, createdUser, 'User registered successfully')
  );

});

const loginUser = asyncHandler(async (req, res) => {
  // Login logic here
  //get user details from request body
  const { email, username, password } = req.body;

  //username or email login
  if (!(email || username)) {
    throw new ApiError(400, 'Email or username is required');
  }

  if (!password) {
    throw new ApiError(400, 'Password is required');
  }

  //find the user
  const user = await User.findOne({ $or: [{ email }, { username }] });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  //check password
  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, 'Invalid password');
  }

  
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id).select('-password -refreshToken'); // Exclude sensitive fields from the response

  //send cookies
  const options = {
    httpOnly: true,
    secure: true
  };
  return res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json(
      new ApiResponse(200, {
        user: loggedInUser,
        accessToken,
        refreshToken
      }, 'User logged in successfully')
    );

});

const logoutUser = asyncHandler(async (req, res) => {
  // remove refresh token from db and set it to undefined
  await User.findByIdAndUpdate(req.user._id, { $set: { refreshToken: undefined } }, { new: true });

  // clear cookies
  const options = {
    httpOnly: true,
    secure: true
  };
  return res
    .status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json(new ApiResponse(200, null, 'User logged out successfully'));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  // Get the refresh token from cookies
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, 'Refresh token is required');
  }

  try {
    // Verify the refresh token
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Find the user by ID
    const user = await User.findById(decodedToken?._id).select('-password -refreshToken');

    if (!user) {
      throw new ApiError(401, 'Invalid or expired refresh token');
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, 'Refresh token is used');
    }

    const options = {
      httpOnly: true,
      secure: true
    };

    const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id);
    
    return res
      .status(200)
      .cookie('accessToken', accessToken, options)
      .cookie('refreshToken', newRefreshToken, options)
      .json(
        new ApiResponse(200, {
          user,
          accessToken,
          refreshToken: newRefreshToken
        }, 'Access token refreshed successfully')
      );

    

    
  } catch (error) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }
});

export { registerUser, loginUser, logoutUser, refreshAccessToken };

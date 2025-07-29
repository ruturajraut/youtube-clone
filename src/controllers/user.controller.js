import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"; // Fixed import path
import { User } from "../models/user.models.js"; // Assuming you have a User model defined
import { uploadOnCloudinary } from "../utils/cloudinary.js"; // Assuming you have a cloudinary utility for file uploads
import { ApiResponse } from "../utils/ApiResponse.js"

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

export { registerUser };
// No changes needed here for Postman form-data usage.

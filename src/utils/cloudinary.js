import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if(!localFilePath) {
      throw new Error("No file path provided for upload");
    }
    //upload file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath,{
        resource_type: "auto", // Automatically detect the resource type (image, video, etc.)
        
    });
    //file uploaded successfully
    console.log("File uploaded successfully:", response.url);

    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // Delete the local file if upload fails
    console.error("Error uploading file to Cloudinary:", error);
    return null; // Return null if upload fails
  }
};

export default uploadOnCloudinary;
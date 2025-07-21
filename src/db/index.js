import 'dotenv/config'; // Load environment variables from .env
import mongoose from 'mongoose';
import {DB_NAME} from '../constants.js';

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('MONGODB_URI is not defined in environment variables.');
    process.exit(1);
  }
  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    console.error(`Invalid MongoDB URI scheme: "${uri}". It must start with "mongodb://" or "mongodb+srv://".`);
    process.exit(1);
  }
  try {
    const connectionInstance = await mongoose.connect(`${uri}/${DB_NAME}`);
    console.log(`Connected to MongoDB database: ${DB_NAME} DB Host: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

export default connectDB;
export { mongoose };
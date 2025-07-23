import mongoose from "mongoose";
import bcrypt from "bcrypt"; // For password hashing
import jwt from "jsonwebtoken"; // For token generation

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
        
    },
    fullname: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar: {
        type: String,  //cloudinary url
        required:true
    },
    coverImage: {
        type: String  //cloudinary url
        
    },

    watchHistory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
    }],

    password: {
        type:String,
        required: [true, 'Password is required'],
    },

    refreshToken: {
        type: String,
        default: null
    }

    
}, { timestamps: true });

userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function() {
    return jwt.sign({ id: this._id, email: this.email, username: this.username, fullname: this.fullname }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY });
};

userSchema.methods.generateRefreshToken = function() {
    return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY });
};

export const User = mongoose.model("User", userSchema);

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { number } = require('zod');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    college: {
        type: String,
    },
    email: {
        type: String,
        unique: true
    },
    phoneNumber: {
        type: String,
        unique: true
    },
    interests: {
        type: [String],
    },
    bio: {
        type: String
    },
    age: {
        type: Number
    },
    rating: {
        type: Number
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    matches: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    displayPicture: {
        type: String,   //cloudinary url or s3 url
    },
    profilePics: {
        type: [String],   //cloudinary url or s3 url
    },
    QuesAnswered: {
        type: [String],
    }
}, { timestamps: true })

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            phoneNumber: this.phoneNumber
        },
        process.env.ACCESS_TOKEN_SECRET
    )
}
module.exports = mongoose.model('User', userSchema)
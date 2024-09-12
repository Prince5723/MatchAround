const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

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
    displayPicture: {
        type: String,   //cloudinary url or s3 url
    },
    profilePics: {
        type: [String],   //cloudinary url or s3 url
    }
}, { timestamps: true })

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            phoneNumber: this.phoneNumber
        },
        process.env.ACCESS_TOKEN_SECRET
    )
}
module.exports = mongoose.model('User', userSchema)
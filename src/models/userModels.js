const mongoose = require('mongoose')

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

module.exports = mongoose.model('User', userSchema)
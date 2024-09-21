const express = require('express');
const router = express.Router();
const User = require('../models/userModels');
const { upload } = require('../middlewares/multerMiddleware');
const { uploadOnCloudinary } = require('../utils/cloudinary');
const zod = require("zod");
const { userSchema: userZodSchema } = require('../types/userZodSchema');
const { verifyJWT } = require('../middlewares/authMiddleware')

router.put('/updateUserInfo', verifyJWT, upload.fields([
    { name: 'displayPicture', maxCount: 1 },
    { name: 'profilePics', maxCount: 4 }
]), async (req, res) => {
    try {

        const { name, college, email, interests, age, bio } = req.body;

        const isOldUser = await User.findOne({ email });
        // console.log(isOldUser)

        if (isOldUser) {
            return res.status(400).json({
                msg: "User already exists"
            });
        }

        const displayPicture = req.files['displayPicture'] ? req.files['displayPicture'][0] : null;
        const profilePics = req.files['profilePics'] ? req.files['profilePics'] : null;

        const user = req.user;

        userZodSchema.parse({
            name,
            college,
            email,
            interests,
            age,
            bio,
            displayPicture,
            profilePics: profilePics.map(file => ({
                fieldname: file.fieldname,
                originalname: file.originalname,
                encoding: file.encoding,
                mimetype: file.mimetype,
                size: file.size,
                path: file.path
            }))
        })

        const dpLocalPath = displayPicture ? displayPicture.path : null;
        const ppLocalPaths = profilePics ? profilePics.map(file => file.path) : null;

        const dpUrl = await uploadOnCloudinary(dpLocalPath);
        const ppUrls = await Promise.all(ppLocalPaths.map(async (ppLocalPath) => await uploadOnCloudinary(ppLocalPath)));

        console.log(dpUrl.secure_url);
        console.log(ppUrls.map((url) => url.secure_url));

        user.name = name;
        user.college = college;
        user.email = email;
        user.interests = interests;
        user.age = age;
        user.bio = bio;
        user.displayPicture = dpUrl.secure_url;
        user.profilePics = ppUrls.map((url) => url.secure_url);

        await user.save();

        // console.log(user);

        res.status(200).json({
            message: "User updated successfully",
            user
        })
    } catch (err) {
        console.log(err);
        res.status(500).json({
            msg: "An error occurred"
        });
    }
});

router.get('/getUserInfo', verifyJWT, async (req, res) => {
    try {
        const user = req.user;
        res.status(200).json({
            user
        })
    } catch (err) {
        console.log(err);
        res.status(500).json({
            msg: "An error occurred"
        });
    }
});

router.put('/updateDisplayPicture', verifyJWT, upload.single('displayPicture'), async (req, res) => {
    try {
        // Retrieve the authenticated user from JWT
        const user = req.user;

        // Check if a new display picture is provided in the request
        const displayPicture = req.file ? req.file : null;

        if (!displayPicture) {
            return res.status(400).json({
                msg: "No display picture provided"
            });
        }

        // Upload the new display picture to Cloudinary
        const dpLocalPath = displayPicture.path;
        const dpUrl = await uploadOnCloudinary(dpLocalPath);

        // Replace the display picture URL in the user's profile
        user.displayPicture = dpUrl.secure_url;

        // Save the updated user in the database
        await user.save();

        res.status(200).json({
            message: "Display picture updated successfully",
            displayPicture: dpUrl.secure_url
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            msg: "An error occurred while updating the display picture"
        });
    }
});

router.delete('/deleteProfilePic', verifyJWT, async (req, res) => {
    try {
        // Get the profilePic index from the request body
        const { profilePicIndex } = req.body;

        // Retrieve the authenticated user from JWT
        const user = req.user;

        // Ensure the user has profile pictures
        if (!user.profilePics || user.profilePics.length === 0) {
            return res.status(400).json({
                msg: "No profile pictures to delete"
            });
        }

        // Check if the provided index is valid
        if (profilePicIndex < 0 || profilePicIndex >= user.profilePics.length) {
            return res.status(400).json({
                msg: "Invalid profile picture index"
            });
        }

        // Remove the profile picture at the specified index
        user.profilePics.splice(profilePicIndex, 1);

        // Save the updated user profile in the database
        await user.save();

        res.status(200).json({
            message: "Profile picture deleted successfully",
            profilePics: user.profilePics // Return updated profilePics array
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            msg: "An error occurred while deleting the profile picture"
        });
    }
});

router.put('/uploadProfilePic', verifyJWT, upload.single('profilePic'), async (req, res) => {
    try {
        // Retrieve the authenticated user from JWT
        const user = req.user;

        // Retrieve the uploaded profile picture from the request
        const profilePic = req.file ? req.file : null;

        if (!profilePic) {
            return res.status(400).json({
                msg: "No profile picture provided"
            });
        }

        // Check if the user already has 4 profile pictures
        if (user.profilePics.length >= 4) {
            return res.status(400).json({
                msg: "You cannot upload more than 4 profile pictures"
            });
        }

        // Upload the new profile picture to Cloudinary
        const uploadedProfilePic = await uploadOnCloudinary(profilePic.path);

        // Append the new profile picture URL to the existing array
        user.profilePics.push(uploadedProfilePic.secure_url);

        // Save the updated user profile in the database
        await user.save();

        res.status(200).json({
            message: "Profile picture uploaded successfully",
            profilePics: user.profilePics // Return updated profilePics array
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            msg: "An error occurred while uploading the profile picture"
        });
    }
});

router.delete('/deleteAccount', verifyJWT, async (req, res) => {
    try {

        const user = req.user;

        if (!user) {
            return res.status(404).json({
                msg: "User not found"
            });
        }

        // Optionally, delete any associated files from Cloudinary : todo

        // Remove the user from the database
        await User.findByIdAndDelete(user._id);

        res.status(200).json({
            message: "User account deleted successfully"
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            msg: "An error occurred while deleting the account"
        });
    }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const User = require('../models/userModels');
const { upload } = require('../middlewares/multerMiddleware');
const zod = require("zod");
const { userSchema: userZodSchema } = require('../types/userZodSchema');

router.put('/updateUserInfo', upload.fields([
    { name: 'displayPicture', maxCount: 1 },
    { name: 'profilePics', maxCount: 4 }
]), (req, res) => {
    try {

        const { name, college, email, interests } = req.body;

        const displayPicture = req.files['displayPicture'] ? req.files['displayPicture'][0] : null;
        const profilePics = req.files['profilePics'] ? req.files['profilePics'] : null;

        // console.log(displayPicture, profilePics);
        
        userZodSchema.parse({
            name,
            college,
            email,
            interests,
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


        res.send("all working fine");
    } catch (err) {
        console.log(err);
        res.status(500).send("An error occurred");
    }
});

module.exports = router;
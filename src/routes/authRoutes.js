const express = require('express')
const router = express.Router();
const dotenv = require('dotenv')
const speakeasy = require('speakeasy');
const twilio = require('twilio')
const User = require('../models/userModels')
const zod = require("zod")

dotenv.config()

// Twilio credentials
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = twilio(accountSid, authToken);

const phoneNumberSchema = zod.string().length(10, "Invalid phone number");

router.post('/send-otp', (req, res) => {
    try {
        // Validate phone number
        let { phoneNumber } = req.body;
        phoneNumberSchema.parse(phoneNumber);
        phoneNumber = "+91" + phoneNumber;

        // Generate OTP
        const otp = speakeasy.totp({ secret: process.env.SPEAKEASY_SECRET, encoding: 'base32' });
        console.log(otp);
        res.send("otp sent successfully, look in the console");

        // Send OTP via Twilio SMS
        // client.messages.create({
        //     body: `Your OTP code for Shiksha verification is ${otp}`,
        //     from: process.env.TWILIO_PHONE_NUMBER,
        //     to: phoneNumber
        // })
        //     .then((message) => {
        //         res.status(200).send(`OTP sent to ${phoneNumber}`);
        //     })
        //     .catch((error) => {
        //         console.error("Failed to send OTP:", error);
        //         res.status(500).send('Failed to send OTP');
        //     });

    } catch (e) {
        if (e instanceof zod.ZodError) {
            res.status(400).json(e.errors);
        } else {
            // Handle unexpected errors
            console.error("An unexpected error occurred:", e);
            res.status(500).send('An unexpected error occurred');
        }
    }
});

router.post('/verify-otp', async (req, res) => {
    const { otp, phoneNumber } = req.body;
    console.log('user sent this otp: ' + otp)

    const verified = speakeasy.totp.verify({
        secret: process.env.SPEAKEASY_SECRET,
        encoding: 'base32',
        token: otp,
        window: 1
    });

    console.log(verified)

    if (verified) {

        const foundUser = await User.findOne({
            phoneNumber
        });

        if (foundUser) {

            console.log("User looged in: ", + foundUser)

            const accessToken = foundUser.generateAccessToken();

            res.status(200).json({
                msg: 'User logged in successfully',
                accessToken
            })
        }

        else {
            const user = await User.create({
                phoneNumber
            });

            const accessToken = user.generateAccessToken();

            res.status(200).json({
                msg: 'User created successfully, Please complete your profile',
                accessToken
            })
        }

    } else {
        res.status(400).send('Invalid OTP');
    }
});



module.exports = router;
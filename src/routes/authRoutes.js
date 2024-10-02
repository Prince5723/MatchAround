const express = require('express')
const router = express.Router();
const dotenv = require('dotenv')
const speakeasy = require('speakeasy');
const twilio = require('twilio')
const User = require('../models/userModels')
const zod = require("zod")
const otpRatelimiter = require('../middlewares/rateLimiters')
dotenv.config()

// Twilio credentials
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = twilio(accountSid, authToken);

const phoneNumberSchema = zod.string().length(10, "Invalid phone number");

router.post('/send-otp', otpRatelimiter, (req, res) => {
    try {
        // Validate phone number
        let { phoneNumber } = req.body;
        phoneNumberSchema.parse(phoneNumber);
        phoneNumber = "+91" + phoneNumber;

        // Generate OTP
        const otp = speakeasy.totp({ secret: process.env.SPEAKEASY_SECRET + phoneNumber, encoding: 'base32' });
        console.log(otp);
        res.send("otp sent successfully, look in the console");

        // Send OTP via Twilio SMS
        // client.messages.create({
        //     body: `Your OTP code for NocTurn is ${otp}`,
        //     from: process.env.TWILIO_PHONE_NUMBER,
        //     to: phoneNumber
        // })
        //     .then((message) => {
        //         res.status(200).json({
        //             msg: `OTP sent to ${phoneNumber}`
        //         });
        //     })
        //     .catch((error) => {
        //         console.error("Failed to send OTP:", error);
        //         res.status(500).json({
        //             msg: "Failed to send OTP"
        //         })
        //     });

    } catch (e) {
        if (e instanceof zod.ZodError) {
            res.status(400).json(e.errors);
        } else {
            // Handle unexpected errors
            console.error("An unexpected error occurred:", e);
            res.status(500).json({
                msg: 'An unexpected error occurred'
            });
        }
    }
});

router.post('/verify-otp', otpRatelimiter, async (req, res) => {
    try {
        let { otp, phoneNumber } = req.body;

        phoneNumber = "+91" + phoneNumber;

        console.log('user sent this otp: ' + otp)

        const verified = speakeasy.totp.verify({
            secret: process.env.SPEAKEASY_SECRET + phoneNumber,
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

                const accessToken = foundUser.generateAccessToken();

                res.status(200).json({
                    msg: 'User logged in successfully',
                    accessToken,
                    foundUser
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
            res.status(400).json({
                msg: 'Invalid OTP'
            });
        }
    }
    catch (e) {
        console.log(e)
        res.status(500).json({
            msg: 'An unexpected error occurred'
        });
    }
});



module.exports = router;
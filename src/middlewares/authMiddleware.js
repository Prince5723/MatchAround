const jwt = require("jsonwebtoken");
const User = require("../models/userModels");

const verifyJWT = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

        // console.log(token);
        if (!token) {
            res.status(401).json({
                msg: "Unauthorized request"
            })
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id)

        if (!user) {

            res.status(401).json({
                msg: "Unauthorized request"
            })
        }

        req.user = user;
        next()
    } catch (error) {
        console.log(error)
        res.status(401).json({
            msg: "Unauthorized request"
        })
    }

}

module.exports = { verifyJWT }
import dotenv from "dotenv"
dotenv.config();
import User from "../models/User.js";
import jwt from "jsonwebtoken";


//middleware to protect routes

export const protectRoute = async(req, res, next) => {
    try{
        // console.log(req.headers);
        const token = req.headers.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select("-password");
        if(!user) {
            return res.json({success: false, message: "user not found"})
        }
        req.user = user;
        next();
    } catch(err) {
        console.error(err.message);
        return res.json({success: false, message: err.message})
    }
}
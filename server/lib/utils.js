import jwt from "jsonwebtoken";

//Fuction to generate a token for a user
export const generateToken = (userId)=> {
    const token = jwt.sign({userId}, process.env.JWT_SECRET);
    return token;
}
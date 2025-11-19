import mongoose from "mongoose";

// function to connect to MongoDB database

export const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/chat-app`)
        console.log("Connected to MongoDB");
    }
    catch (err) {
        console.error("Error connecting to MongoDB:", err);
    }
}
import mongoose from "mongoose";

export const connectDB = async (url) => {
    try {
        await mongoose.connect(url);
        console.log('MongoDB connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}
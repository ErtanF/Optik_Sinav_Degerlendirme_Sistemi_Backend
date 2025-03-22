import mongoose from "mongoose";
import { DB_URI , NODE_ENV } from "../config/env.js";


if(!DB_URI){
    throw new Error("Please define the DB_URI in the .env file");
}

const connectDB = async () => {
    try {
        await mongoose.connect(DB_URI);
        console.log(`MongoDB connected: ${NODE_ENV} mode`);
    } catch (error) {
        console.error(`Error Connecting to database : ` , error);
        process.exit(1);
    }
}

export default connectDB;
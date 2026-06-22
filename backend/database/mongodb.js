import mongoose from "mongoose";
import dns from "dns";

import { DB_URI, NODE_ENV } from "../config/env.js";

if(!DB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env<development/production>.local')
}

// Force Google DNS — fixes SRV lookup failures caused by ISP/router DNS restrictions
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectToDatabase = async () => {
    try{
        await mongoose.connect(DB_URI);

        console.log(`Connected to database in ${NODE_ENV} mode`)
    } catch (error){
        console.error('⚠️  Error connecting to database:', error.message);
        console.error('👉 Check: MongoDB Atlas cluster is running and credentials are correct');
        // Server stays running — API routes will fail until DB is connected
    }
}

export default connectToDatabase; 
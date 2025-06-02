import mongoose from "mongoose";
import { config as dotenvConfig } from "dotenv";
import { userData } from "./data.js";
import User from "../models/user.model.js";
dotenvConfig();
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("DataBase Connected successfully");
  } catch (error) {
    console.error("Failed to connect to DB:", error);
    process.exit(1); // Exit the process with failure
  }
}

export const seedUser=async()=>{
    try {
        for(const user of userData){
            const existingUser=await User.findOne({email:user.email})
            if(!existingUser){
                const newUser=await User.create(user)
                console.log("User created : ",newUser.email)
            }else{
                console.log("User already exists : ",existingUser.email)
            }
        }
    } catch (error) {
        console.error("Error seeding data:", error);
    }
}


const seedData=async()=>{
    try {
        await connectDB()
        Promise.all(
            [seedUser()]
        )
    } catch (error) {
        console.error("Error seeding data:", error);
        process.exit(1); 
    }
}

seedData()
import app from "./app.js";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLIENT_NAME || process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CLIENT_API || process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_CLIENT_SECRET || process.env.CLOUDINARY_API_SECRET,
});

app.listen(4000, () => {
  console.log(`Server is running on port 4000 (with static /new and /uploads support)`);
});

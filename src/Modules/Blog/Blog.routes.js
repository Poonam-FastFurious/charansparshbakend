import { Router } from "express";

import { createBlogPost, getAllBlogPosts } from "./Blog.controler.js";
import { upload } from "../../middlewares/FileUpload.middlwares.js";


const router = Router();

// Route to add a new blog post
router.post("/add",
      upload.fields([
            { name: "thumbnail", maxCount: 1 }, // Assuming single thumbnail upload
            { name: "gallery", maxCount: 10 }   // Assuming multiple gallery images upload
      ]),
      createBlogPost
);
router.get("/allblogs", getAllBlogPosts);




export default router;

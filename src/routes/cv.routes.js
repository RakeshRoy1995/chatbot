import express from "express";
import multer from "multer";
import { analyzeCVPage, uploadCV } from "../controllers/cv.controller.js";

const router = express.Router();

// storage config
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// routes
router.get("/", analyzeCVPage);
router.post("/upload", upload.single("cv"), uploadCV);

export default router;
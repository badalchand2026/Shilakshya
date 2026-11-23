
import express from "express";
import { submitContactInquiry } from "./contact.controller.js";
import { contactLimiter } from "../../middlewares/rate-limit.middleware.js";

const router = express.Router();

// Public contact form submission
router.post("/", contactLimiter, submitContactInquiry);

export default router;

import express from "express";
import { submitContactInquiry } from "./contact.controller.js";
import { getAllContactInquiriesController, getContactInquiryByIdController,} from "./contact.admin.controller.js";
import { contactLimiter } from "../../middlewares/rate-limit.middleware.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/role.middleware.js";




const router = express.Router();



// Public contact form submission.
router.post("/", contactLimiter, submitContactInquiry);

// Admin: Get all contact inquiries.
router.get("/admin", authenticate, authorizeRoles("ADMIN"), getAllContactInquiriesController);
router.get("/admin/:id", authenticate, authorizeRoles("ADMIN"), getContactInquiryByIdController);
export default router;

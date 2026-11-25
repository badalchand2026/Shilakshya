
import express from "express";

import {
    getPublicWhyChooseUsController,
    getPublicWhyChooseUsByIdController,
} from "./public-why-choose-us.controller.js";

const router = express.Router();

// Get all published items
router.get("/", getPublicWhyChooseUsController);

// Get one published item
router.get("/:id", getPublicWhyChooseUsByIdController);

export default router;

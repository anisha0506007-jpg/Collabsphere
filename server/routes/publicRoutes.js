
import express from "express";
import {
  getPublicProject,
} from "../controllers/shareController.js";

const router = express.Router();

router.get("/projects/:token", getPublicProject);

export default router;

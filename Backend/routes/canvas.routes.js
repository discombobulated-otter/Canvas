
import  { GetAllCanvas, GetCanvasWithId } from "../controllers/canvas.controller.js";

import {verifyClerkAuth} from "../middewares/authenticate.js"
import express from 'express';
import { requireAuth } from "@clerk/express";

const router = express.Router();


router.get(
  "/:userId",
  requireAuth(),
  verifyClerkAuth,
  GetAllCanvas
);

router.get(
  "/:userId/:id",
  requireAuth(),
  verifyClerkAuth,
  GetCanvasWithId
);


export default router;
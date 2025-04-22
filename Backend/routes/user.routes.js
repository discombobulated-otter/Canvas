import handler from "../controllers/user.controller.js";
import SaveCanvas, { GetAllCanvas } from "../controllers/canvas.controller.js";
import { check } from 'express-validator';
import {verifyClerkAuth} from "../middewares/authenticate.js"
import express from 'express';
import { requireAuth } from "@clerk/express";
import handleValidation from "../middewares/handleValidation.js";

const router = express.Router();

router.post(
  "/sign",
  requireAuth(),
  [
    check('id', 'ID is required').not().isEmpty(),
    check('email', 'Email is required').not().isEmpty(),
    check('name', 'Name is required').not().isEmpty(),
    check('imageUrl', 'Image URL is required').not().isEmpty(),
  ],
  handler
);

// Add canvas route
router.post(
  "/add-canvas",(req,res,next)=>{
    console.log("non")
    next()
  },
  requireAuth(),(req,res,next)=>{
    console.log("non")
    next()
  },
  verifyClerkAuth,
  [
    check('userId', 'User ID is required').not().isEmpty(),
    check('canvasData', 'Canvas Data is required').not().isEmpty(),
    check('name', 'Canvas name is required').trim().not().isEmpty().isLength({ max: 100 }).withMessage("Canvas name should be under 100 characters")
    .escape()],
  handleValidation,
  SaveCanvas
);
router.get(
  "/canvas/:userId",
  requireAuth(),
  verifyClerkAuth,
  GetAllCanvas
);


export default router;
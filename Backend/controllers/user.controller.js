// controllers/user.controller.js
import { validationResult } from "express-validator";
import User from "../models/user.model.js";

const handler = async (req, res) => {
  const errors = validationResult(req);
  console.log("errors->>>>>>.")
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id, email, name, imageUrl } = req.body;
 

  try {
    let user = await User.findOne({ clerkId: id });
    if (!user) {
      user = await User.create({ clerkId: id, email, name, imageUrl });
    }
    return res.status(200).json({ message: "User synced", user });
  } catch (err) {
    console.error(err);
   return  res.status(500).json({ error: "Server error" });
  }
};

export default handler;

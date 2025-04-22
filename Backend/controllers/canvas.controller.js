import Canvas from "../models/canvas.model.js";
import User from "../models/user.model.js";

const SaveCanvas = async (req, res) => {
  try {
    const { canvasData, userId, name } = req.body;

    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    console.log("Canvas Data Type:", typeof canvasData); // Ensure canvasData is in expected format
    let canvas = null;
    try {
      canvas = await Canvas.create({
        userId: user._id,
        canvasData: JSON.stringify(canvasData),
        name,
      });
      console.log("Canvas created:", canvas);
    } catch (createError) {
      console.log("Error creating canvas:", createError.message);
      return res.status(500).json({ success: false, message: createError.message });
    }

    return res.status(201).json({ message: "Canvas saved successfully", success: true, canvas });
  } catch (error) {
    console.log("Error saving canvas:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error saving canvas",
      error: error.message,
    });
  }
};

export const GetAllCanvas = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const canvases = await Canvas.find({ userId: user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      canvases,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch canvases",
      error: error.message,
    });
  }
};

export const GetCanvasWithId = async (req, res) => {
  try {
    const { userId, id } = req.params
    console.log(req.params); // Extract userId and id from request parameters

    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const canvas = await Canvas.findOne({ userId: user._id, _id: id });

    if (!canvas) {
      return res.status(404).json({ success: false, message: "Canvas not found" });
    }

    res.status(200).json({
      success: true,
      canvas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch canvas",
      error: error.message
    });
  }
};

export default SaveCanvas;

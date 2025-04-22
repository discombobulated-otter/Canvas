import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true
  },
  // Add other user model fields here, e.g.
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  imageUrl: {
    type: String,
    required: true
  }
});

const User = mongoose.model('User', userSchema);

export default User




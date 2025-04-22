import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const canvasSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  canvasData: { type: String, required: true },
  name:{type:String,required:true}
});

export default mongoose.model('Canvas', canvasSchema);

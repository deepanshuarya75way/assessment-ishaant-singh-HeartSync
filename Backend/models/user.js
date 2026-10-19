// Backend/MODEL/user.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  lovedOneName: String,
  relationship: String,
  personality: String,
  interests: String,
  privacyConsentAt:{
    type:Date,
    default:null
  },
  dateRetentionUntil:{
    type:Data,
    default:null
  }

}, { timestamps: true });

export default mongoose.model('User', userSchema);

const { default: mongoose } = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
    unique: true, // Đảm bảo không trùng email
  },
  phone: {
    type: String,
    require: true,
    unique: true,
  },
  photo: {
    type: String,
  },
  category: {
    type: [String],
    default: [],
  },
  password: {
    type: String,
    require: true,
  },
  avatarUrl: {
    type: String,
    default: null,
  },
  biography: {
    type: String,
    default: "",
  },
  platform: {
    type: [String],
    default: [],
  },
  connectedSocialMedias: {
    type: [String],
    default: [],
  },
  role: {
    type: String,
    enum: ["MANAGER", "CREATOR"],
    default: "CREATOR",
  },
  brand_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Brand", // Liên kết với bảng Brand
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
  otp: {
    type: String,
  },
  otpExpires: {
    type: Date,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
});

const UserModel = mongoose.model("users", UserSchema);
module.exports = UserModel;

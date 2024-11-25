const mongoose = require('mongoose');

const CampaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  deadline: { type: String, required: true },
  budget: { type: Number, required: true },
  minAge: { type: Number, required: true },
  maxAge: { type: Number, required: true },
  age: { type: [Number] },
  gender: { type: String, enum: ['male', 'female', 'all'], required: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  status: {
    type: String,
    enum: ['active', 'draft', 'archive'],
    required: true,
  },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'brands' },
  content: { type: mongoose.Schema.Types.ObjectId, ref: 'contents' },
  socialMedia: { type: [String], required: true },
  location: { type: String, required: true },
  discount: { type: Number, required: true },
  campaignOverview: { type: String, required: true },
  isDeleted: { type: Boolean, default: false },
  activatedAt: { type: Date, default: Date.now },
  deletedAt: { type: Date },
});

CampaignSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
CampaignSchema.set('toJSON', {
  virtuals: true,
});

const CampaignModel = mongoose.model('campaign', CampaignSchema);
module.exports = CampaignModel;

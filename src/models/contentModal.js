// const mongoose = require('mongoose');

// const ContentSchema = new mongoose.Schema({
//   files: [{ type: String, required: true }],
//   caption: { type: String, required: false },
//   note: { type: String, required: false },
//   status: { type: String, enum: ['draft', 'upload'] },
//   createdAt: { type: Date, default: Date.now },
// });

// const ContentModel = mongoose.model('contents', ContentSchema);
// module.exports = ContentModel;

const mongoose = require('mongoose');

const ContentSchema = new mongoose.Schema(
  {
    campaignId: { type: String,}, // To match campaignId in ContentType
    creatorId: { type: String,}, // To match creatorId in ContentType
    urls: { type: [String], required: true }, // Array of strings for URLs
    approved: { type: String, enum: ['approved', 'rejected', 'pending', 'draft', 'posted'], required: false }, // Status field with the enum values from ContentStatus
    approvedBy: { type: String, }, // To match approvedBy in ContentType
    reason: { type: String, required: false }, // To match reason in ContentType
    caption: { type: String, required: true }, // Optional caption
    campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'campaign', }, // Reference to the Campaign model
    notes: { type: String, required: true }, // Optional notes
    isDeleted: { type: Boolean, default: false }, // To track if deleted
    deletedAt: { type: Date, default: null }, // Timestamp for when deleted
    createdAt: { type: Date, default: Date.now }, // Automatically set to current time
    updatedAt: { type: Date, default: Date.now }, // Automatically set to current time
    post_due: { type: Date, }, // To match post_due in ContentType
    suggestedPostDue: { type: Date, default: null }, // Optional date
    isSuggestedPostDueAccepted: { type: Number, }, // Number indicating acceptance status
    trackingUrl: { type: String, }, // URL for tracking
  }
);

ContentSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
ContentSchema.set('toJSON', {
  virtuals: true,
});

// Create model from schema
const ContentModel = mongoose.model('contents', ContentSchema);
module.exports = ContentModel;

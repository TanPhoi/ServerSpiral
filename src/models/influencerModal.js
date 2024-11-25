const mongoose = require('mongoose');

const InfluencerSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
    },
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'campaign',
      required: true,
    },
    status: {
      type: String,
      enum: [
        'waiting_to_apply',
        'accepted_invitation',
        'declined_invitation',
        'joined_campaign',
        'brand_declined_influencer',
      ],
      required: true,
    },
  },
  { timestamps: true }
);

const InfluencerModel = mongoose.model('influencer', InfluencerSchema);
module.exports = InfluencerModel;

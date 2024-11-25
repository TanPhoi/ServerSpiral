const asyncHandle = require('express-async-handler');
const InfluencerModel = require('../models/influencerModal');
const CampaignModel = require('../models/campaignModel');
const ContentModel = require('../models/contentModal');
require('dotenv').config();

const getContents = asyncHandle(async(req ,res) => {
    const { creatorId } = req.params; // Get creatorId from URL params
    const { status, limit, page } = req.query; // Get query parameters

    const influencers = await InfluencerModel.find({ creator: creatorId });
    if (!influencers.length) {
        return res.status(404).json({ error: 'No influencers found for the given creatorId' });
      }
    
  // Lấy tất cả campaign IDs từ influencers
    const campaignIds = influencers.map((influencer) => influencer.campaign);
    const campaigns = await CampaignModel.find({ _id: { $in: campaignIds } });
    if (!campaigns.length) {
      return res.status(404).json({ error: 'No campaigns found for the influencers' });
    }

    const contentIds = campaigns.map((campaign) => campaign.content);
    // Tạo bộ lọc
    const filter = { _id: { $in: contentIds } };
    if (status) {
      if (status === 'submitted') {
        // Bao gồm các trạng thái 'approved', 'rejected', và 'pending'
        filter.approved = { $in: ['approved', 'rejected', 'pending'] };
      } else {
        // Lọc chính xác theo trạng thái
        filter.approved = status;
      }
    }

    const data = await ContentModel.find(filter)
    .populate({
      path: 'campaign',
      populate: {
        path: 'brand', // Lấy thông tin thương hiệu nếu cần
      },
    })
    .exec();

    if (!data.length) {
      return res.status(404).json({ error: 'No campaigns found for the influencers' });
    }

  res.status(200).json({
    message: 'OK',
    data : {
      data,
    }
  });
});

const getContentDetail = asyncHandle(async(req,res) => {
  const { id } = req.params;

  try {
    const data = await ContentModel.findOne({ _id: id })
    .populate({
      path: 'campaign', 
      populate: {
        path: 'brand',
      },
    })
    .exec();

    if (!data) {
      return res.status(404).send({ message: 'Content not found' });
    }

    res.status(200).json({
      message: 'OK',
      data : {
        data,
      }
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).send({ message: 'Internal server error' });
  }
});

module.exports = {
    getContents,
    getContentDetail
};
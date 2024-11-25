const asyncHandle = require('express-async-handler');
const CampaignModel = require('../models/campaignModel');
const InfluencerModel = require('../models/influencerModal');
const { saveUser } = require('../controllers/authController');
const BrandModel = require('../models/brandModel');
const ContentModel = require('../models/contentModal');
require('dotenv').config();

const getExploreCampaign = asyncHandle(async (req, res) => {
  const { limit, page } = req.query;
  try {
    const data = await InfluencerModel.find()
      .sort({ createdAt: -1 })
      .populate('creator')
      .populate({
        path: 'campaign', // Populate dữ liệu của campaign
        populate: { path: 'brand' }, // Populate chi tiết của brand trong campaign
      })
      .limit(limit)
      .skip((page - 1) * limit);

    res.status(200).json({
      message: 'Influencers fetched successfully',
      data: {
        data,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching influencers',
      error: error.message,
    });
  }
});

const setExploreCampaign = asyncHandle(async (req, res) => {
  const {
    name,
    budget,
    minAge,
    maxAge,
    age,
    gender,
    discountType,
    status,
    socialMedia,
    location,
    discount,
    campaignOverview,
    isDeleted,
    brandName,
    brandPhone,
    brandIndustry,
    brandCategory,
    creatorId,
  } = req.body;

  try {
    // Tạo Brand mới
    const newBrand = new BrandModel({
      name: brandName,
      phone: brandPhone,
      industry: brandIndustry,
      category: brandCategory,
    });
    await newBrand.save();

    // Tạo campaign mới
    const newCampaign = new CampaignModel({
      name,
      deadline: new Date(),
      budget,
      minAge,
      maxAge,
      age,
      gender,
      discountType,
      status,
      socialMedia,
      location,
      discount,
      campaignOverview,
      isDeleted,
      brand: newBrand._id,
      activatedAt: new Date(),
    });
    await newCampaign.save();

    // Tạo influencer mới cho campaign vừa tạo
    const influencer = new InfluencerModel({
      creator: creatorId,
      campaign: newCampaign._id,
      status: 'waiting_to_apply',
    });
    await influencer.save();

    res.status(200).json({
      message: 'New campaign and influencer successfully created',
      influencer: influencer,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error creating campaign or influencer',
      error: error.message,
    });
  }
});

const responseInvitationOfBrand = asyncHandle(async (req, res) => {
  const { campaignId, accepted } = req.body;

  const existingCampaign = await InfluencerModel.findOne({
    campaign: campaignId,
  });

  if (!existingCampaign) {
    res.status(401);
    throw new Error('Campaign has already exist!!!');
  }

  existingCampaign.status = accepted
    ? 'joined_campaign'
    : 'declined_invitation';
  await existingCampaign.save();
  res.status(200).json({ message: 'Response recorded successfully!' });
});

const getCampaigns = asyncHandle(async (req, res) => {
  const { limit, page, status, creatorId } = req.query;

  try {
    const query = {};

    // Kiểm tra và thêm status vào query nếu có
    if (status) {
      query.status = status;
    }

    if (creatorId) {
      query.creator = creatorId;
    }

    const data = await InfluencerModel.find(query)
      .populate('creator')
      .populate({
        path: 'campaign',
        populate: { path: 'brand' },
      })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    res.status(200).json({
      message: 'Campaigns fetched successfully',
      data: {
        data,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching campaigns',
      error: error.message,
    });
  }
});

const getCampaignDetails = asyncHandle(async (req, res) => {
  const { id } = req.params;

  try {
    const data = await InfluencerModel.findOne({
      campaign: id,
    })
      .populate('creator')
      .populate({
        path: 'campaign',
        populate: { path: 'brand' },
      })
      .lean();

    res.status(200).json({
      message: 'Campaigns fetched successfully',
      data,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching campaigns',
      error: error.message,
    });
  }
});

const draftContent = asyncHandle(async (req, res) => {
  const { campaignId } = req.params;
  const { caption, note } = req.body;
  const files = req.files;
  const influencer = await InfluencerModel.findOne({ campaign: campaignId });

  if (!influencer) {
    return res.status(404).send('Campaign not found');
  }

  const campaign = await CampaignModel.findById(campaignId);

  if (!campaign) {
    return res.status(404).send('Campaign not found');
  }

  const fileUris = files.map((file) => `${req.protocol}://${req.get('host')}/uploads/${file.filename}`);

  const content = new ContentModel({
    urls: fileUris,
    caption,
    campaign: campaignId,
    notes : note,
    approved:'draft'
  });

  await content.save();

  campaign.content = content._id;
  await campaign.save();

  res.status(200).json({
    message: 'Draft success',
    campaign,
  });
});

const uploadContent = asyncHandle(async (req, res) => {
  const { campaignId } = req.params;
  const { caption, note } = req.body;
  const files = req.files;
  const influencer = await InfluencerModel.findOne({ campaign: campaignId });

  if (!influencer) {
    return res.status(404).send('Campaign not found');
  }

  const campaign = await CampaignModel.findById(campaignId);

  if (!campaign) {
    return res.status(404).send('Campaign not found');
  }

  const fileUris = files.map((file) => `${req.protocol}://${req.get('host')}/uploads/${file.filename}`);

  const content = new ContentModel({
    urls: fileUris,
    caption,
    campaign: campaignId,
    notes : note,
    approved:'pending'
  });

  await content.save();

  campaign.content = content._id;
  await campaign.save();

  res.status(200).json({
    message: 'Upload success',
    campaign,
  });
});

module.exports = {
  getExploreCampaign,
  setExploreCampaign,
  getCampaigns,
  responseInvitationOfBrand,
  getCampaignDetails,
  draftContent,
  uploadContent,
};

const Router = require('express');
const {
  getExploreCampaign,
  setExploreCampaign,
  getCampaigns,
  responseInvitationOfBrand,
  getCampaignDetails,
  draftContent,
  uploadContent,
} = require('../controllers/campaignController');
const upload = require('../configs/multerConfig');

const campaignRouter = Router();

campaignRouter.get('/api/v1/campaign', getExploreCampaign);
campaignRouter.get('/api/v1/campaign-creator/invited-campaigns', getCampaigns);
campaignRouter.post('/post/campaigns', setExploreCampaign);
campaignRouter.post(
  '/api/v1/creator/:campaignId/invite-response',
  responseInvitationOfBrand
);
campaignRouter.get(
  '/api/v1/campaign-creator/:id/details-for-creator',
  getCampaignDetails
);
campaignRouter.post(
  '/api/v1/creator/:campaignId/draft-content',
  upload,
  draftContent
);
campaignRouter.post(
  '/api/v1/creator/:campaignId/upload-content',
  upload,
  uploadContent
);

module.exports = campaignRouter;

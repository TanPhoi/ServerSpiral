const Router = require('express');
const { getContents, getContentDetail } = require('../controllers/contentController');

const contentRouter = Router();

contentRouter.get('/api/v1/creator/:creatorId/contents', getContents);
contentRouter.get('/api/v1/content/:id', getContentDetail);

module.exports = contentRouter;

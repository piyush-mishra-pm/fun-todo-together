const express = require('express');
const tagRouter = new express.Router();
const tagController = require('../controllers/tag');
const authMiddleware = require('../middlewares/auth');

tagRouter.get(
    '/tag/:tagid',
    authMiddleware.allowOnlyAuthenticated,
    tagController.getTag
);
tagRouter.get(
    '/tags',
    authMiddleware.allowOnlyAuthenticated,
    tagController.getTags
);
tagRouter.post(
    '/tag',
    authMiddleware.allowOnlyAuthenticated,
    tagController.createTag
);
tagRouter.patch(
    '/tag/:id',
    authMiddleware.allowOnlyAuthenticated,
    tagController.updateTag
);
tagRouter.delete(
    '/tag/:id',
    authMiddleware.allowOnlyAuthenticated,
    tagController.deleteTag
);

module.exports = tagRouter;

const express = require('express');
const router = express.Router();
const requireLogin = require('../middlewares/requireLogin');
const { revokeKey, rotateKey } = require('../controllers/key.controller');

router.use(requireLogin);

router.post('/:id/revoke', revokeKey);
router.post('/:id/rotate', rotateKey);

module.exports = router;
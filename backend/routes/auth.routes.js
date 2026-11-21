const express = require('express');
const router = express.Router();
const { register, login, logout, me } = require('../controllers/auth.controller');

const requireLogin = require('../middlewares/requireLogin');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', requireLogin, me);

module.exports = router;
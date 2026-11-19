const express = require('express');
const router = express.Router();
const requireLogin = require('../middlewares/requireLogin');
const { createKey, listKeys } = require('../controllers/key.controller');
const {
  listWorkspaces,
  createWorkspace,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
} = require('../controllers/workspace.controller');

router.use(requireLogin); // every workspace route needs a logged-in user

router.get('/', listWorkspaces);
router.post('/', createWorkspace);
router.get('/:id', getWorkspace);
router.patch('/:id', updateWorkspace);
router.delete('/:id', deleteWorkspace);


router.get('/:id/keys', listKeys);
router.post('/:id/keys', createKey);

module.exports = router;
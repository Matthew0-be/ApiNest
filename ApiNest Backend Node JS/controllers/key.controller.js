const mongoose = require('mongoose');
const ApiKey = require('../models/apiKey.model');
const Workspace = require('../models/workspace.model');
const { generateKey } = require('../utils/apiKey');

const MAX_ACTIVE_KEYS = 5;

// The hash is never included here, and neither is the full key
const safeKey = (k) => ({
  id: k._id,
  label: k.label,
  prefix: k.prefix,
  status: k.status,
  createdAt: k.createdAt,
  revokedAt: k.revokedAt,
  replacedBy: k.replacedBy,
  lastUsedAt: k.lastUsedAt,
});

const findOwnedWorkspace = async (id, userId) => {
  if (!mongoose.isValidObjectId(id)) return null;
  return Workspace.findOne({ _id: id, owner: userId });
};

// A key is yours only if its workspace is yours
const findOwnedKey = async (id, userId) => {
  if (!mongoose.isValidObjectId(id)) return null;
  const key = await ApiKey.findById(id);
  if (!key) return null;
  const workspace = await Workspace.findOne({ _id: key.workspace, owner: userId });
  return workspace ? key : null;
};

const createKey = async (req, res) => {
  try {
    const workspace = await findOwnedWorkspace(req.params.id, req.user.id);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    const { label } = req.body;
    if (label !== undefined && (typeof label !== 'string' || label.length > 50)) {
      return res.status(400).json({ message: 'Label must be text up to 50 characters' });
    }

    const activeCount = await ApiKey.countDocuments({ workspace: workspace._id, status: 'active' });
    if (activeCount >= MAX_ACTIVE_KEYS) {
      return res.status(400).json({ message: `A workspace can have at most ${MAX_ACTIVE_KEYS} active keys` });
    }

    const { fullKey, prefix, keyHash } = generateKey();
    const record = await ApiKey.create({
      workspace: workspace._id,
      createdBy: req.user.id,
      label: label && label.trim() ? label.trim() : undefined,
      prefix,
      keyHash,
    });

    res.set('Cache-Control', 'no-store');
    res.status(201).json({ key: fullKey, ...safeKey(record) });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

const listKeys = async (req, res) => {
  try {
    const workspace = await findOwnedWorkspace(req.params.id, req.user.id);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }
    const keys = await ApiKey.find({ workspace: workspace._id }).sort({ createdAt: -1 });
    res.status(200).json(keys.map(safeKey));
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

const revokeKey = async (req, res) => {
  try {
    const key = await findOwnedKey(req.params.id, req.user.id);
    if (!key) {
      return res.status(404).json({ message: 'Key not found' });
    }
    if (key.status === 'revoked') {
      return res.status(409).json({ message: 'Key is already revoked' });
    }
    key.status = 'revoked';
    key.revokedAt = new Date();
    await key.save();
    res.status(200).json(safeKey(key));
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

const rotateKey = async (req, res) => {
  try {
    const key = await findOwnedKey(req.params.id, req.user.id);
    if (!key) {
      return res.status(404).json({ message: 'Key not found' });
    }
    if (key.status !== 'active') {
      return res.status(409).json({ message: 'Only an active key can be rotated' });
    }

    // Create the new key first, so a failure never leaves the workspace with no working key
    const { fullKey, prefix, keyHash } = generateKey();
    const newKey = await ApiKey.create({
      workspace: key.workspace,
      createdBy: req.user.id,
      label: key.label,
      prefix,
      keyHash,
    });

    // The status filter makes sure two rotations at once cannot both succeed
    const old = await ApiKey.findOneAndUpdate(
      { _id: key._id, status: 'active' },
      { status: 'revoked', revokedAt: new Date(), replacedBy: newKey._id },
      { new: true }
    );
    if (!old) {
      await newKey.deleteOne();
      return res.status(409).json({ message: 'This key was already revoked' });
    }

    res.set('Cache-Control', 'no-store');
    res.status(201).json({ key: fullKey, ...safeKey(newKey), replaced: safeKey(old) });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

module.exports = { createKey, listKeys, revokeKey, rotateKey };
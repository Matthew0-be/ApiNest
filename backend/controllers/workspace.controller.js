const mongoose = require('mongoose');
const Workspace = require('../models/workspace.model');
const ApiKey = require('../models/apiKey.model');

// Finds the workspace only if it exists AND belongs to this user.

// Not found and not yours both return null, so a stranger learns nothing.

const findOwned = async (id, userId) => {
  if (!mongoose.isValidObjectId(id)) return null;
  return Workspace.findOne({ _id: id, owner: userId });
};

const listWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(workspaces);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

const createWorkspace = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ message: 'Name must be at least 2 characters' });
    }
    const workspace = await Workspace.create({
      name,
      description: typeof description === 'string' ? description : '',
      owner: req.user.id, // from the login token, never from the request body
    });
    res.status(201).json(workspace);
  } catch (err) {
     
  if (err.code === 11000) {
    return res.status(409).json({ message: 'You already have a workspace with that name' });
  }
    console.log(err);
    res.status(500).json({ message: 'Something went wrong' });
};
}

const getWorkspace = async (req, res) => {
  try {
    const workspace = await findOwned(req.params.id, req.user.id);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }
    res.status(200).json(workspace);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

const updateWorkspace = async (req, res) => {
  try {
    const workspace = await findOwned(req.params.id, req.user.id);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }
    const { name, description } = req.body;
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length < 2) {
        return res.status(400).json({ message: 'Name must be at least 2 characters' });
      }
      workspace.name = name;
    }
    if (description !== undefined) {
      if (typeof description !== 'string') {
        return res.status(400).json({ message: 'Description must be text' });
      }
      workspace.description = description;
    }
    await workspace.save();
    res.status(200).json(workspace);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

const deleteWorkspace = async (req, res) => {
  try {
    const workspace = await findOwned(req.params.id, req.user.id);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }
    await ApiKey.deleteMany({ workspace: workspace._id });
    // Day 2: also delete this workspace's keys here
    await workspace.deleteOne();
    res.status(200).json({ message: 'Workspace deleted' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

module.exports = {
  listWorkspaces,
  createWorkspace,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
};
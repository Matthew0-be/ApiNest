const mongoose = require('mongoose');

const apiKeySchema = new mongoose.Schema({
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  label: { type: String, trim: true, default: 'Default key' },
  prefix: { type: String, required: true },
  keyHash: { type: String, required: true, unique: true },
  status: { type: String, enum: ['active', 'revoked'], default: 'active' },
  revokedAt: { type: Date },
  replacedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'ApiKey' },
  lastUsedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('ApiKey', apiKeySchema);
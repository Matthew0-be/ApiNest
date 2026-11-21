const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2 },
  description: { type: String, trim: true, default: '' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requestsPerMinute: { type: Number, default: 10 },
  requestsPerDay: { type: Number, default: 200 },
}, { timestamps: true });

workspaceSchema.index(
  { owner: 1, name: 1 },
  { unique: true, collation: { locale: 'en', strength: 2 } }
);

module.exports = mongoose.model('Workspace', workspaceSchema);
const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetType: { type: String, enum: ['question', 'answer'], required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  type: { type: String, enum: ['up', 'down'], required: true }
}, { timestamps: true });

voteSchema.index({ userId: 1, targetType: 1, targetId: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);

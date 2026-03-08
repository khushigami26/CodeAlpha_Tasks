const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    default: 'todo',
  },
  color: {
    type: String,
    default: 'bg-[#0c66e4]',
  },
}, {
  timestamps: true,
});

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;

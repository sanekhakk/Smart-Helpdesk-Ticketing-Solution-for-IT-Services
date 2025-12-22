const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  status: {
    type: String,
    enum: ['Open', 'Closed', 'Escalated','Processing'],
    default: 'Open'
  },
  messages: [
    {
      role: String, // 'user' | 'assistant'
      content: String,
      createdAt: { type: Date, default: Date.now }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Ticket', TicketSchema);

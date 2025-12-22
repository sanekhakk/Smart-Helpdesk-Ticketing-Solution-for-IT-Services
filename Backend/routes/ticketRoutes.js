const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const axios = require('axios');

// ---------------- CREATE TICKET ----------------
router.post('/create', async (req, res) => {
  const { title, description, category } = req.body;

  const ticket = new Ticket({
    title,
    description,
    category: category || 'Hardware',
    status: 'Open',
    messages: [{ role: 'user', content: description }]
  });

  await ticket.save();

  res.json(ticket);
});

// ---------------- AI CHAT ----------------
router.post('/chat', async (req, res) => {
  const { ticketId, messages } = req.body;

  const response = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: "google/gemini-2.0-flash-001",
      messages
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );

  const aiReply = response.data.choices[0].message.content;

  await Ticket.findByIdAndUpdate(ticketId, {
    messages: [
      ...messages,
      { role: 'assistant', content: aiReply }
    ]
  });

  res.json({ content: aiReply });
});

// ---------------- ESCALATE TICKET ----------------
router.patch('/:id/escalate', async (req, res) => {
  try {
    // Change status to 'Processing' instead of 'Escalated'
    const updatedTicket = await Ticket.findByIdAndUpdate(
      req.params.id, 
      { status: 'Processing' },
      { new: true } // returns the updated document
    );
    
    if (!updatedTicket) {
      return res.status(404).json({ error: "Ticket not found" });
    }
    
    res.json({ success: true, ticket: updatedTicket });
  } catch (error) {
    console.error('Error escalating ticket:', error);
    res.status(500).json({ error: "Failed to escalate ticket" });
  }
});

// ---------------- CLOSE TICKET ----------------
router.patch('/:id/close', async (req, res) => {
  try {
    const updatedTicket = await Ticket.findByIdAndUpdate(
      req.params.id, 
      { status: 'Closed' },
      { new: true }
    );
    
    if (!updatedTicket) {
      return res.status(404).json({ error: "Ticket not found" });
    }
    
    res.json({ success: true, ticket: updatedTicket });
  } catch (error) {
    console.error('Error closing ticket:', error);
    res.status(500).json({ error: "Failed to close ticket" });
  }
});

// ---------------- DELETE TICKET ----------------
router.delete('/:id', async (req, res) => {
  try {
    await Ticket.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete ticket" });
  }
});

// ---------------- GET ALL ----------------
router.get('/', async (req, res) => {
  const tickets = await Ticket.find().sort({ createdAt: -1 });
  res.json(tickets);
});

// ---------------- GET ONE ----------------
router.get('/:id', async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  res.json(ticket);
});

module.exports = router;
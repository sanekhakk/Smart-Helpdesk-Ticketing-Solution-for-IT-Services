const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const { categorizeTicket } = require('../utils/aiHelper'); // Import the AI helper

router.post('/create', async (req, res) => {
  try {
    const { title, description } = req.body;

    // 1. Call the AI to get a category
    const aiCategory = await categorizeTicket(description);

    // 2. Create the ticket with the AI's category
    const newTicket = new Ticket({ 
      title, 
      description,
      category: aiCategory 
    });

    await newTicket.save();
    res.status(201).json(newTicket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
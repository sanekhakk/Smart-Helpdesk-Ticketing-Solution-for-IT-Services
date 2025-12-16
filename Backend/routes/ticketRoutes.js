const express = require('express');
const router = express.Router(); // This line was likely missing
const Ticket = require('../models/Ticket');

// A simple manual categorizer (since we are not using AI)
const getManualCategory = (desc) => {
  const text = desc.toLowerCase();
  if (text.includes("wifi") || text.includes("internet")) return "Network";
  if (text.includes("laptop") || text.includes("hardware") || text.includes("printer")) return "Hardware";
  if (text.includes("login") || text.includes("password") || text.includes("account")) return "Access";
  return "Software"; 
};

// Now 'router' will be defined here
router.post('/create', async (req, res) => {
  try {
    const { title, description } = req.body;
    const category = getManualCategory(description);

    const newTicket = new Ticket({ title, description, category });
    await newTicket.save();
    res.status(201).json(newTicket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Ticket.findByIdAndDelete(req.params.id);
    res.json({ message: "Ticket deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// This route handles GET http://localhost:5000/api/tickets/
router.get('/', async (req, res) => {
  try {
    const allTickets = await Ticket.find().sort({ createdAt: -1 });
    res.json(allTickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ensure you have this at the bottom!
module.exports = router;
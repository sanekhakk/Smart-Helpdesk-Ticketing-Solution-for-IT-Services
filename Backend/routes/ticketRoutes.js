const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const axios = require('axios');

/* ================= CATEGORIZATION LOGIC ================= */
async function categorizeTicket(title, description) {
  // Combine title and description for keyword matching
  const searchText = `${title} ${description}`.toLowerCase();
  
  let category = 'Other';
  let priority = 'Medium';
  let department = 'Help Desk';
  let reasoning = 'Manual keyword-based classification';

  // 1. MANUAL KEYWORD LOGIC (Runs first to ensure accuracy)
  
  // ✅ NETWORK
  if (searchText.match(/\b(network|internet|wifi|wi-fi|vpn|router|lan|wan|disconnect|no internet|slow internet|connection failed)\b/)) {
    category = 'Network';
    department = 'Network Team';
  }
  // ✅ SECURITY
  else if (searchText.match(/\b(virus|malware|hack|phishing|breach|ransomware|suspicious)\b/)) {
    category = 'Security';
    department = 'Security Team';
    priority = 'High';
  }
  // ✅ ACCOUNT
  else if (searchText.match(/\b(login|password|account|locked|access denied|permission)\b/)) {
    category = 'Account';
    department = 'Help Desk';
  }
  // ✅ SOFTWARE
  else if (searchText.match(/\b(software|application|app crash|install|update|bug|error code)\b/)) {
    category = 'Software';
    department = 'IT Support';
  }
  // ✅ HARDWARE
  else if (searchText.match(/\b(printer|keyboard|mouse|monitor|cpu|laptop|desktop|hardware|physical damage)\b/)) {
    category = 'Hardware';
    department = 'IT Support';
  }

  // Priority boost for urgent keywords
  if (searchText.match(/\b(down|not working|urgent|critical|unable|failed)\b/)) {
    priority = 'High';
  }

  // 2. AI REFINEMENT (Optional: Only runs if category is still 'Other' and key exists)
  if (category === 'Other' && process.env.OPENROUTER_API_KEY) {
    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'google/gemini-2.0-flash-001',
          messages: [
            {
              role: 'system',
              content: `You are an IT support classifier. Return ONLY valid JSON. 
                        Category MUST be: Hardware, Software, Network, Account, Security, or Other.
                        Priority MUST be: Low, Medium, High, or Critical.`
            },
            { role: 'user', content: `Title: ${title}\nDescription: ${description}` }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const raw = response.data.choices[0].message.content;
      const json = JSON.parse(raw.match(/\{[\s\S]*\}/)[0]);

      const validCategories = ['Hardware', 'Software', 'Network', 'Account', 'Security', 'Other'];
      return {
        category: validCategories.includes(json.category) ? json.category : 'Other',
        priority: json.priority || 'Medium',
        department: json.department || 'Help Desk',
        confidence: 0.9,
        reasoning: 'AI assisted classification'
      };
    } catch (err) {
      console.error('AI Categorization Failed:', err.message);
    }
  }

  return {
    category,
    priority,
    department,
    confidence: 0.85,
    reasoning
  };
}


/* ================= CREATE TICKET ================= */
router.post('/create', async (req, res) => {
  try {
    // Expect userId to be sent from the frontend now
    const { title, description, userId } = req.body; 

    const ai = await categorizeTicket(title, description);

    const ticket = new Ticket({
      user: userId, // Save the ID of the logged-in user
      title,
      description,
      category: ai.category,
      priority: ai.priority,
      department: ai.department,
      aiConfidence: ai.confidence,
      aiReasoning: ai.reasoning,
      status: 'Open',
      messages: [{ role: 'user', content: description }]
    });

    ticket.calculateSLA();
    await ticket.save();

    const aiSolution = await generateInitialResponse(ticket);

    res.json({
      _id: ticket._id,
      title: ticket.title,
      category: ticket.category,
      priority: ticket.priority,
      department: ticket.department,
      confidence: ticket.aiConfidence,
      aiSuggestion: aiSolution
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ticket creation failed' });
  }
});

/* ================= AI SOLUTION ================= */
async function generateInitialResponse(ticket) {
  if (!process.env.OPENROUTER_API_KEY) {
    return `I've categorized this as ${ticket.category}. Please wait for a human agent.`;
  }
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'google/gemini-2.0-flash-001',
        messages: [{ role: 'system', content:
          `You are a friendly IT Support Assistant. 
            STRICT RULES:
            1. DO NOT use asterisks (**) or any markdown symbols. Use plain text only.
            2. START by saying: "I have identified this as a ${ticket.category} issue."
            3. Then provide a warm, helpful, short step-by-step solution.
            4. Keep the total response under 3-4 sentences.
            5. Be very friendly and professional.`
          },
                   { role: 'user', content: `Issue: ${ticket.title}\nDetails: ${ticket.description}` }],
                   temperature: 0.4
      },
      { headers: { 'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`, 'HTTP-Referer': 'http://localhost:5173', 'X-Title': 'SmartHelp AI',
          'Content-Type': 'application/json' } ,timeout: 15000}
    );
    return response.data.choices[0].message.content;
  } catch (err) { // Fixed: added 'err' here
    console.error('AI Response Failed:', err.message);
    return `Categorized as ${ticket.category}. Agent will assist soon.`;
  }
}
/* ================= CHAT ================= */
router.post('/chat', async (req, res) => {
  try {
    const { messages, category, ticketId } = req.body;

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-3.5-turbo',
        messages,
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const reply = response.data.choices[0].message.content;

    if (ticketId) {
      await Ticket.findByIdAndUpdate(ticketId, {
        $push: {
          messages: [
            { role: 'user', content: messages[messages.length - 1].content },
            { role: 'assistant', content: reply }
          ]
        }
      });
    }

    res.json({ content: reply });
  } catch {
    res.status(500).json({ content: 'AI service unavailable' });
  }
});

/* ================= STATUS ACTIONS ================= */
router.patch('/:id/escalate', async (req, res) => {
  const ticket = await Ticket.findByIdAndUpdate(
    req.params.id,
    { status: 'Escalated', assignedTo: 'Human Agent' },
    { new: true }
  );
  res.json(ticket);
});

router.patch('/:id/close', async (req, res) => {
  try {
    const { adminFeedback } = req.body; // Capture the feedback from the request body
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'Closed', 
        'sla.resolvedAt': new Date(),
        aiReasoning: adminFeedback // We can store admin feedback in aiReasoning or a new field
      },
      { new: true }
    );
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: 'Failed to close ticket' });
  }
});

/* ================= FETCH ================= */
router.get('/', async (req, res) => {
  // In a production app, you'd add middleware here to check if user.role === 'admin'
  try {
    const tickets = await Ticket.find().sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch all tickets" });
  }
});

/* ================= FETCH USER TICKETS ================= */
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    // Find only tickets where the 'user' field matches the ID from the URL
    const tickets = await Ticket.find({ user: userId }).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    console.error("Error fetching user tickets:", err);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

router.delete('/:id', async (req, res) => {
  await Ticket.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;

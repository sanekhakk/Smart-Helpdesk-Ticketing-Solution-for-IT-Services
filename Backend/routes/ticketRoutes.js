const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const axios = require('axios');

/* ================= AI CATEGORIZATION ================= */
async function categorizeTicket(title, description) {
  if (process.env.OPENROUTER_API_KEY) {
    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'google/gemini-2.0-flash-001',
          messages: [
            {
              role: 'system',
              content: `You are an IT support classifier. 
              Return ONLY valid JSON. 
              Category MUST be one of: Hardware, Software, Network, Account, Security, Other.
              Priority MUST be: Low, Medium, High, or Critical.`
            },
            { role: 'user', content: `Title: ${title}\nDescription: ${description}` }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'HTTP-Referer': 'http://localhost:5173',
            'X-Title': 'SmartHelp AI',
            'Content-Type': 'application/json'
          }
        }
      );
      const raw = response.data.choices[0].message.content;
      const json = JSON.parse(raw.match(/\{[\s\S]*\}/)[0]);

      // Ensure the category is valid before returning
      const validCategories = ['Hardware', 'Software', 'Network', 'Account', 'Security', 'Other'];
      return {
        category: validCategories.includes(json.category) ? json.category : 'Other',
        priority: json.priority || 'Medium',
        department: json.department || 'Help Desk',
        confidence: json.confidence || 0.8,
        reasoning: json.reasoning || 'AI classified'
      };
    } catch (err) {
      console.error('AI Categorization Failed:', err.message);
    }
  }

  /* ================= FALLBACK (FIXED LOGIC) ================= */

  let category = 'Other';
  let priority = 'Medium';
  let department = 'Help Desk';

  // ✅ NETWORK — FIRST
  if (text.match(/\b(network|internet|wifi|wi-fi|vpn|router|lan|wan|disconnect|no internet|slow internet|connection failed)\b/)) {
    category = 'Network';
    department = 'Network Team';
  }

  // ✅ SECURITY
  else if (text.match(/\b(virus|malware|hack|phishing|breach|ransomware|suspicious)\b/)) {
    category = 'Security';
    department = 'Security Team';
    priority = 'High';
  }

  // ✅ ACCOUNT
  else if (text.match(/\b(login|password|account|locked|access denied|permission)\b/)) {
    category = 'Account';
    department = 'Help Desk';
  }

  // ✅ SOFTWARE
  else if (text.match(/\b(software|application|app crash|install|update|bug|error code)\b/)) {
    category = 'Software';
    department = 'IT Support';
  }

  // ✅ HARDWARE — LAST
  else if (text.match(/\b(printer|keyboard|mouse|monitor|cpu|laptop|desktop|hardware|physical damage)\b/)) {
    category = 'Hardware';
    department = 'IT Support';
  }

  // Priority boost
  if (text.match(/\b(down|not working|urgent|critical|unable|failed)\b/)) {
    priority = 'High';
  }

  return {
    category,
    priority,
    department,
    confidence: 0.85,
    reasoning: 'Fallback keyword-based classification'
  };
}

/* ================= CREATE TICKET ================= */
router.post('/create', async (req, res) => {
  try {
    const { title, description } = req.body;

    const ai = await categorizeTicket(title, description);

    const ticket = new Ticket({
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
  const ticket = await Ticket.findByIdAndUpdate(
    req.params.id,
    { status: 'Closed', 'sla.resolvedAt': new Date() },
    { new: true }
  );
  res.json(ticket);
});

/* ================= FETCH ================= */
router.get('/', async (req, res) => {
  const tickets = await Ticket.find().sort({ createdAt: -1 });
  res.json(tickets);
});

router.get('/:id', async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  res.json(ticket);
});

router.delete('/:id', async (req, res) => {
  await Ticket.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');


const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB successfully!"))
  .catch((err) => console.error("Could not connect to MongoDB:", err));

// Test Route
app.get('/', (req, res) => {
  res.send('Helpdesk Server is Running and Database is Connected!');
});

const PORT = process.env.PORT || 5000;

const ticketRoutes = require('./routes/ticketRoutes');
app.use('/api/tickets', ticketRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
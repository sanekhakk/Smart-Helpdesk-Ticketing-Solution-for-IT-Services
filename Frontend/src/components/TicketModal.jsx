import React, { useState } from 'react';
import axios from 'axios';
import { X, Send } from 'lucide-react';

const TicketModal = ({ isOpen, onClose, onTicketCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/tickets/create', {
        title,
        description
      });
      onTicketCreated(res.data); 
      onClose(); 
      setTitle('');
      setDescription('');
    } catch (err) {
      console.error("Submission failed", err);
      alert("Make sure your Backend server is running on port 5000");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-800">New Support Request</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">Subject</label>
            <input 
              className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-600 outline-none transition-all"
              placeholder="e.g., PC won't turn on"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">Issue Details</label>
            <textarea 
              className="w-full border border-slate-200 rounded-xl p-3 h-32 focus:ring-2 focus:ring-blue-600 outline-none transition-all resize-none"
              placeholder="Describe what's happening..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70"
          >
            {loading ? "Saving..." : "Submit Ticket"} 
            {!loading && <Send size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TicketModal;
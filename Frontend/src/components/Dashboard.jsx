import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LayoutDashboard, Ticket, CheckCircle, Clock } from 'lucide-react';
import TicketModal from './TicketModal';

const Dashboard = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    // This fetches data from  Node.js backend
    axios.get('http://localhost:5000/api/tickets')
      .then(res => setTickets(res.data))
      .catch(err => console.error("Make sure your backend is running!", err));
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white p-6 shadow-xl">
        <h1 className="text-2xl font-bold mb-10 flex items-center gap-3 text-blue-400">
          <Ticket size={28} /> SmartHelp
        </h1>
        <nav className="space-y-6">
          <div className="flex items-center gap-3 text-white bg-blue-600/20 p-3 rounded-lg border border-blue-500/30 shadow-sm cursor-pointer">
            <LayoutDashboard size={20} /> Dashboard
          </div>
          <div className="flex items-center gap-3 text-slate-400 hover:text-white p-3 transition-all cursor-pointer">
            <CheckCircle size={20} /> Resolved
          </div>
          <div className="flex items-center gap-3 text-slate-400 hover:text-white p-3 transition-all cursor-pointer">
            <Clock size={20} /> History
          </div>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-10 overflow-y-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-800">Support Queue</h2>
            <p className="text-slate-500 mt-1">Manage and resolve AI-categorized tickets.</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className=" bg-slate-900 hover:bg-slate-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-200 transition-all">
            + New Ticket
          </button>
        </div>

        {/* Tickets List */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-sm font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-5">Issue Title</th>
                <th className="p-5">AI Category</th>
                <th className="p-5">Status</th>
                <th className="p-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tickets.map((ticket) => (
                <tr key={ticket._id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-5 font-semibold text-slate-700">{ticket.title}</td>
                  <td className="p-5">
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tighter">
                      {ticket.category || 'Processing...'}
                    </span>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-2 text-amber-600 font-medium text-sm">
                      <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                      Open
                    </div>
                  </td>
                  <td className="p-5 text-right">
                    <button className="text-blue-600 hover:underline font-medium text-sm">View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {tickets.length === 0 && (
            <div className="p-20 text-center flex flex-col items-center">
              <div className="bg-slate-100 p-4 rounded-full mb-4">
                <Ticket size={40} className="text-slate-300" />
              </div>
              <p className="text-slate-400 font-medium">Your queue is empty. Start by submitting a ticket!</p>
            </div>
          )}
        </div>
      </div>

      <TicketModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onTicketCreated={(newTicket) => setTickets([newTicket, ...tickets])} />
    </div>
  );
};

export default Dashboard;
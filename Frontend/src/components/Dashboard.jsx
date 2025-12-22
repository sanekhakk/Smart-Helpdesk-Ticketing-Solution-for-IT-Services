import React, { useEffect, useState, useRef } from 'react';
import {
  Plus,
  Search,
  MoreVertical,
  Trash2,
  Download,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import SideBar from './SideBar.jsx';
import TicketModal from './TicketModal';

const Dashboard = ({ onLogout }) => {
  const [tickets, setTickets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('dashboard');

  const menuRef = useRef({});

  /* ---------------- FETCH ---------------- */
  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/tickets');
      const data = await res.json();
      setTickets(data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  /* ---------------- CLICK OUTSIDE DROPDOWN ---------------- */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        openMenuId &&
        menuRef.current[openMenuId] &&
        !menuRef.current[openMenuId].contains(e.target)
      ) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  /* ---------------- ACTIONS ---------------- */
  const openNewTicket = () => {
    setSelectedTicket(null);
    setIsModalOpen(true);
  };

  const openExistingTicket = (ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  const closeTicket = async (id) => {
  try {
    const response = await fetch(`http://localhost:5000/api/tickets/${id}/close`, {
      method: 'PATCH',
    });
    
    if (response.ok) {
      setOpenMenuId(null);
      await fetchTickets(); // Re-fetch only after the patch is confirmed
    }
  } catch (error) {
    console.error('Error closing ticket:', error);
  }
};

  const escalateTicket = async (id) => {
  try {
    const response = await fetch(`http://localhost:5000/api/tickets/${id}/escalate`, {
      method: 'PATCH',
    });

    if (response.ok) {
      setOpenMenuId(null);
      await fetchTickets(); // Re-fetch to update UI
    }
  } catch (error) {
    console.error('Error escalating ticket:', error);
  }
};
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this ticket?')) return;
    try {
      await fetch(`http://localhost:5000/api/tickets/${id}`, {
        method: 'DELETE',
      });
      fetchTickets();
    } catch (error) {
      console.error('Error deleting ticket:', error);
    }
  };

  /* ---------------- COMPUTED ---------------- */
  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch = ticket.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const normalizedStatus = ticket.status?.toLowerCase().replace(/\s/g, '');
    const matchesFilter = filterStatus === 'all' || normalizedStatus?.includes(filterStatus);
    return matchesSearch && matchesFilter;
  });

  const getStatusConfig = (status) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('closed'))
      return { color: 'text-slate-500', bg: 'bg-slate-100', icon: CheckCircle2 };
    if (s.includes('escalate'))
      return { color: 'text-amber-600', bg: 'bg-amber-100', icon: AlertCircle };
    if (s.includes('progress'))
      return { color: 'text-blue-600', bg: 'bg-blue-100', icon: Clock };
    return { color: 'text-emerald-600', bg: 'bg-emerald-100', icon: TrendingUp };
  };

  const getPriorityColor = (category) => {
    const c = category?.toLowerCase() || '';
    if (c.includes('hardware')) return 'border-rose-500';
    if (c.includes('software')) return 'border-blue-500';
    if (c.includes('network')) return 'border-purple-500';
    return 'border-slate-300';
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <SideBar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 px-10 py-6 flex justify-between items-center shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Ticket Management</h1>
            <p className="text-sm text-slate-500 mt-1">Monitor and manage support requests</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center gap-2">
              <Download size={16} /> Export
            </button>
            <button
              onClick={openNewTicket}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:opacity-90 transition-all"
            >
              <Plus size={18} /> New Ticket
            </button>
          </div>
        </div>

        {/* SEARCH + FILTER */}
        <div className="bg-white/60 backdrop-blur-sm px-10 py-4 border-b border-slate-200/60 flex gap-3 shrink-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tickets..."
              className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
          <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1">
            {['all', 'open', 'escalated', 'closed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filterStatus === status ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="flex-1 p-10 overflow-y-auto">
          {/* CRITICAL FIX: overflow-visible ensures the absolute dropdown is not clipped */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-visible">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-6 text-xs font-bold text-slate-600 text-left">Issue</th>
                  <th className="p-6 text-xs font-bold text-slate-600 text-left">Category</th>
                  <th className="p-6 text-xs font-bold text-slate-600 text-left">Status</th>
                  <th className="p-6 text-xs font-bold text-slate-600 text-left">ETA</th>
                  <th className="p-6 text-xs font-bold text-slate-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTickets.map((ticket) => {
                  const statusConfig = getStatusConfig(ticket.status);
                  const StatusIcon = statusConfig.icon;

                  return (
                    <tr key={ticket._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-6">
                        <div className={`border-l-4 pl-3 ${getPriorityColor(ticket.category)}`}>
                          <div className="font-bold text-slate-900">{ticket.title}</div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">ID: {ticket._id?.slice(-8)}</div>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md bg-slate-100 text-slate-600">
                          {ticket.category || 'Hardware'}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${statusConfig.bg}`}>
                          <StatusIcon size={14} className={statusConfig.color} />
                          <span className={`text-xs font-bold ${statusConfig.color}`}>{ticket.status}</span>
                        </div>
                      </td>
                      <td className="p-6 text-sm text-slate-500 font-medium">15â€“20 mins</td>
                      <td className="p-6 text-right relative overflow-visible">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openExistingTicket(ticket)}
                            className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Resume
                          </button>
                          <button 
                            onClick={() => handleDelete(ticket._id)} 
                            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                          <button
                            onClick={() => setOpenMenuId(openMenuId === ticket._id ? null : ticket._id)}
                            className={`p-2 rounded-lg transition-all ${openMenuId === ticket._id ? 'bg-slate-100 text-blue-600' : 'text-slate-500 hover:bg-slate-100'}`}
                          >
                            <MoreVertical size={16} />
                          </button>
                        </div>

                        {/* DROPDOWN MENU */}
                        {openMenuId === ticket._id && (
                          <div
                            ref={(el) => (menuRef.current[ticket._id] = el)}
                            className="absolute right-6 top-16 w-52 bg-white rounded-xl shadow-2xl border border-slate-200 z-[100] animate-in fade-in zoom-in duration-200"
                          >
                            <button
                              onClick={() => closeTicket(ticket._id)}
                              className="w-full px-5 py-3 text-left text-sm hover:bg-slate-50 flex items-center gap-3 font-medium text-slate-700 first:rounded-t-xl"
                            >
                              <CheckCircle2 size={16} className="text-emerald-500" /> Close Ticket
                            </button>
                            <button
                              onClick={() => escalateTicket(ticket._id)}
                              className="w-full px-5 py-3 text-left text-sm text-amber-700 hover:bg-amber-50 flex items-center gap-3 font-medium border-t border-slate-100 last:rounded-b-xl"
                            >
                              <AlertCircle size={16} className="text-amber-500" /> Escalate to Human
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredTickets.length === 0 && (
              <div className="py-20 text-center text-slate-400 font-medium">No tickets matching your search.</div>
            )}
          </div>
        </div>
      </main>

      <TicketModal
        isOpen={isModalOpen}
        ticket={selectedTicket}
        onClose={() => {
          setIsModalOpen(false);
          fetchTickets();
        }}
        onTicketUpdated={fetchTickets}
      />
    </div>
  );
};

export default Dashboard;
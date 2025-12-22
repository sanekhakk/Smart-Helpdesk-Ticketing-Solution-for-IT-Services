import {
  LayoutDashboard,
  Ticket,
  BookOpen,
  HelpCircle,
  MessageSquare,
  LogOut
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, onLogout }) => {
  return (
    <aside className="w-72 bg-slate-950 text-white flex flex-col border-r border-slate-800">
      <div className="p-8">
        {/* Logo */}
        <div className="flex items-center gap-3 text-2xl font-bold tracking-tight mb-12">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
            <Ticket size={24} />
          </div>
          <span>
            SmartHelp<span className="text-blue-500">AI</span>
          </span>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 p-3.5 rounded-xl font-semibold transition-all ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <LayoutDashboard size={20} /> My Tickets
          </button>

          <button
            onClick={() => setActiveTab('kb')}
            className={`w-full flex items-center gap-3 p-3.5 rounded-xl font-semibold transition-all ${
              activeTab === 'kb'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BookOpen size={20} /> Knowledge Base
          </button>

          <button className="w-full flex items-center gap-3 text-slate-400 hover:text-white hover:bg-white/5 p-3.5 rounded-xl font-medium transition-all">
            <HelpCircle size={20} /> Get Help
          </button>
        </nav>

        {/* Support Box */}
        <div className="mt-12 p-5 bg-blue-600/10 rounded-2xl border border-blue-500/20">
          <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <MessageSquare size={14} /> Need more help?
          </h4>
          <p className="text-[11px] text-slate-300 mb-4">
            Our support team is available 24/7 for urgent issues.
          </p>
          <button className="text-[11px] font-bold text-white bg-blue-600 w-full py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Chat with Agent
          </button>
        </div>
      </div>

      {/* Logout */}
      <div className="mt-auto p-8 border-t border-slate-900">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-red-500/10 hover:text-red-500 border border-slate-800 p-3.5 rounded-xl font-semibold text-slate-400 transition-all"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

import React from 'react';
import { 
  Sparkles, Zap, ShieldCheck, ArrowRight, Activity, Globe, 
  ShieldAlert, Cpu, Users, BarChart3, Clock, AlertTriangle,
  Ticket 
} from 'lucide-react';
import BgVideo from '../assets/AI_Ticketing_Helpdesk_Background_Video.mp4';

const Home = ({ username = "Support User", onStartTicket, user , stats}) => {
  // Identify if the logged-in user has administrative privileges
  const isAdmin = user?.role === 'admin';

  return (
    <div className="relative flex-1 h-full overflow-y-auto overflow-x-hidden flex flex-col">
      {/* Background Video Layer */}
      <div className="absolute inset-0 h-[600px] overflow-hidden opacity-70 pointer-events-none">
        <video autoPlay loop muted playsInline className="absolute min-w-full min-h-full object-cover">
          <source src={BgVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50"></div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col pt-20 pb-12 px-8 lg:px-24">
        <div className="max-w-5xl animate-in fade-in slide-in-from-bottom-8 duration-700">
          {/* Status Badge: Admin specific messaging */}
          <div className="inline-flex items-center gap-2 bg-blue-600/10 backdrop-blur-md border border-blue-200 px-4 py-2 rounded-full text-blue-800 text-xs font-black mb-8">
            <Activity size={14} className="animate-pulse" />
            <span className="uppercase tracking-[0.2em]">
              {isAdmin ? "Admin Console: Active" : "Live System Status: Optimal"}
            </span>
          </div>

          {/* Greeting: Admin-specific heading */}
          <h1 className="text-6xl lg:text-6xl font-black text-slate-900 mb-6 tracking-tighter leading-none">
            {isAdmin ? "System Control," : "Welcome back,"}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-800 to-indigo-600 ml-3">
              {username}.
            </span>
          </h1>
          
          {/* Description: Tailored for administrative oversight */}
          <p className="text-xl font-medium text-slate-600 mb-10 leading-relaxed max-w-2xl">
            {isAdmin 
              ? "Global infrastructure monitoring and ticket escalation management. Oversee AI performance and human intervention queues."
              : "Experience the future of IT support. Our Gemini-powered AI classifies your issues in milliseconds and provides instant resolutions."}
          </p>

          {/* Conditional Action Buttons: Hide ticket creation for admins */}
          {!isAdmin && (
            <div className="flex flex-wrap gap-4 mb-16">
              <button 
                onClick={onStartTicket}
                className="bg-slate-900 hover:bg-slate-800 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all shadow-2xl flex items-center gap-3 group"
              >
                Raise a New Ticket <Zap size={20} className="fill-current group-hover:scale-125 transition-transform" />
              </button>
            </div>
          )}
        </div>

        {/* Admin Dashboard Stats: Displays oversight metrics instead of personal ticket status */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {(isAdmin ? [
            { label: "Pending Escalations", val: "05", color: "text-rose-600", icon: AlertTriangle },
            { label: "Total Users", val: "1.2k", color: "text-blue-600", icon: Users },
            { label: "System Load", val: "24%", color: "text-emerald-600", icon: BarChart3 },
            { label: "Avg. Resolve Time", val: "4.2m", color: "text-purple-600", icon: Clock }
          ] : [
            { label: "Active Tickets", val: stats?.activeTickets < 10 ? `0${stats?.activeTickets}` : stats?.activeTickets || "00", color: "text-blue-600", icon: Ticket },
            { label: "AI Resolution Rate", val: stats?.aiResolutionRate || "94%", color: "text-emerald-600", icon: Sparkles },
            { label: "Avg. Response", val: stats?.avgResponse || "< 1m", color: "text-purple-600", icon: Clock },
            { label: "System Uptime", val: stats?.systemUptime || "99.9%", icon: Activity }
          ]).map((stat, i) => (
            <div key={i} className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                <stat.icon size={16} className={stat.color} />
              </div>
              <p className={`text-3xl font-black ${stat.color}`}>{stat.val}</p>
            </div>
          ))}
        </div>

        {/* Infrastructure Nodes: Only visible to admins to monitor system components */}
        {isAdmin && (
          <div className="mb-16">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-8 text-center">
              Infrastructure Nodes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm group">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-800 mb-6 group-hover:bg-blue-800 group-hover:text-white transition-all">
                  <ShieldCheck size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Security Clusters</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">Firewall and MFA nodes operating with 0% packet loss.</p>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full w-[90%]"></div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm group">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-800 mb-6 group-hover:bg-emerald-800 group-hover:text-white transition-all">
                  <Globe size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Network Traffic</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">Global VPN gateways reporting 12ms latency.</p>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full w-[75%]"></div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm group">
                <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-800 mb-6 group-hover:bg-purple-800 group-hover:text-white transition-all">
                  <Cpu size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">AI Compute</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">Gemini neural units allocated for real-time triage.</p>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-purple-600 h-full w-[40%]"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Performance Card */}
        <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
          <div className="relative z-10 max-w-xl">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-widest mb-4">
              <Sparkles size={16} /> Powered by Gemini 2.0
            </div>
            <h2 className="text-3xl font-bold mb-4">Neural Infrastructure Status</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Our AI engine is currently operating at peak performance, monitoring global ticket trends to provide accurate troubleshooting.
            </p>
          </div>
          <div className="relative z-10 flex gap-4">
             <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl text-center">
                <p className="text-2xl font-black">{isAdmin ? "142" : "2.4k"}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase">{isAdmin ? "Active Sessions" : "AI Fixes Today"}</p>
             </div>
          </div>
        </div>

        <footer className="text-center pb-8">
          <p className="text-slate-400 text-xs font-black uppercase tracking-[0.3em]">
            © 2025 SmartHelpAI • Intelligence in Every Ticket
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Home;
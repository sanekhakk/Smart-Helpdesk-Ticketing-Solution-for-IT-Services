import React from 'react';
import { 
  Zap, Bot, Shield, BarChart3, 
  Clock, MessageSquare, Cpu, Globe 
} from 'lucide-react';
import BgVideo from '../assets/AI_Ticketing_Helpdesk_Background_Video.mp4';
import {Link} from 'react-router-dom'

const Features = () => {
  const featureList = [
    {
      title: "Gemini 2.0 AI Engine",
      description: "Automatically categorizes and prioritizes tickets in milliseconds using advanced neural processing.",
      icon: <Cpu className="text-blue-600" size={28} />,
      badge: "AI Powered"
    },
    {
      title: "Real-time AI Chatbot",
      description: "Interactive triage system that provides instant self-service resolutions before human intervention.",
      icon: <Bot className="text-indigo-600" size={28} />,
      badge: "Interactive"
    },
    {
      title: "Smart Triage & Routing",
      description: "Intelligent keyword matching routes tickets to the correct department instantly.",
      icon: <Zap className="text-amber-500" size={28} />,
      badge: "Efficiency"
    },
    {
      title: "Infrastructure Monitoring",
      description: "Admin oversight of global system health, network traffic, and compute cluster status.",
      icon: <Globe className="text-emerald-600" size={28} />,
      badge: "Oversight"
    },
    {
      title: "SLA Tracking",
      description: "Automated response and resolution deadline calculations based on ticket priority levels.",
      icon: <Clock className="text-purple-600" size={28} />,
      badge: "Compliance"
    },
    {
      title: "Secure Authentication",
      description: "Robust security with JWT tokens and OTP verification for protected user data.",
      icon: <Shield className="text-rose-600" size={28} />,
      badge: "Security"
    }
  ];

  return (
    <div className=" min-h-screen font-sans">
        {/* Background Video Container */}
              <div className="absolute inset-0 -z-10 overflow-hidden">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute min-w-full min-h-full object-cover opacity-50"
                >
                  {/* 2. Use the imported BgVideo variable here */}
                  <source src={BgVideo} type="video/mp4" />
                  
                  {/* Fallback image if video fails to load */}
                  <img src="/fallback-image.jpg" className="absolute min-w-full min-h-full object-cover opacity-100" alt="background" />
                </video>
                
              </div>
        
              {/* Navigation */}
              <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-2 text-2xl font-bold text-slate-900">
                  <div className="bg-blue-800 p-1.5 rounded-lg">
                    <Bot className="text-white" size={24} />
                  </div>
                  <span>SmartHelp <span className="text-blue-800">AI</span></span>
                </div>
                <div className="hidden md:flex items-center gap-8 font-medium text-slate-600">
                  <Link to="/features" className="hover:text-blue-800 transition-colors">Features</Link>
                  {/* UPDATED: Login Button */}
                  <button 
                    onClick={() => onEnter('login')} 
                    className="hover:text-blue-800 transition-colors"
                  >
                    Login
                  </button>
                  
                  {/* UPDATED: Sign Up Free Button */}
                  <button 
                    onClick={() => onEnter('signup')}
                    className="bg-slate-900 text-white px-6 py-2.5 rounded-full hover:bg-slate-800 transition-all shadow-md"
                  >
                    Sign Up Free
                  </button>
                </div>
              </nav>
      {/* Hero Header */}
      <section className="bg-slate-50 py-20 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <h1 className="text-5xl font-black text-slate-900 mb-6 tracking-tight leading-none">
            Next-Gen <span className="text-blue-800">Support Logic.</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            SmartHelpAI isn't just a ticketing tool—it's a neural infrastructure 
            designed to solve problems before they reach your desk.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-8 ">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-9">
          {featureList.map((feature, index) => (
            <div key={index} className="group relative bg-blue-200 p-5 rounded-3xl ">
              <div className="mb-6 w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:bg-blue-50 group-hover:text-blue-600 shadow-sm border border-slate-100">
                {feature.icon}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-800 mb-2 block">
                {feature.badge}
              </span>
              <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-800 transition-colors">
                {feature.title}
              </h3>
              <p className="text-slate-500 leading-relaxed text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="py-12 border-t border-slate-100 text-center">
        <p className="text-slate-400 text-xs font-black uppercase tracking-[0.3em]">
          © 2025 SmartHelpAI • Intelligence in Every Ticket
        </p>
      </footer>
    </div>
  );
};

export default Features;
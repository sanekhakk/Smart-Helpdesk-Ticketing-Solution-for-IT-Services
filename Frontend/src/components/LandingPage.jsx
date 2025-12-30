import React, { useState, useEffect } from 'react';
import { ArrowRight, Bot, Shield, Zap, CheckCircle2, User, Sparkles, Printer } from 'lucide-react';
import BgVideo from '../assets/AI_Ticketing_Helpdesk_Background_Video.mp4';
import { useNavigate, Link } from 'react-router-dom';
const LandingPage = ({ onEnter }) => {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
 
  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    
    <div className="relative min-h-screen text-slate-900 font-sans selection:bg-blue-100 overflow-hidden">
     
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute min-w-full min-h-full object-cover opacity-50"
        >
         
          <source src={BgVideo} type="video/mp4" />
        
          <img src="/fallback-image.jpg" className="absolute min-w-full min-h-full object-cover opacity-100" alt="background" />
        </video>
        
      </div>

      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <div className="bg-blue-800 p-1.5 rounded-lg">
            <Bot className="text-white" size={24} />
          </div>
          <span>SmartHelp <span className="text-blue-800">AI</span></span>
        </div>
        <div className="hidden md:flex items-center gap-8 font-medium text-slate-600">
          <Link to="/features" className="hover:text-blue-800 transition-colors">Features</Link>
        
          <button 
            onClick={() => onEnter('login')} 
            className="hover:text-blue-800 transition-colors"
          >
            Login
          </button>
          
        
          <button 
            onClick={() => onEnter('signup')}
            className="bg-slate-900 text-white px-6 py-2.5 rounded-full hover:bg-slate-800 transition-all shadow-md"
          >
            Sign Up Free
          </button>
        </div>
      </nav>

    
      <header className="relative pt-12 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-16 items-center">
          <div className="z-10">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-800"></span>
              </span>
              v2.0: Real-time AI Resolution
            </div>
            <h1 className="text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.1]">
              Support that <span className="text-blue-800 italic">thinks</span> ahead.
            </h1>
            <p className="text-xl text-slate-900 font-bold mb-10 leading-relaxed max-w-lg">
              The AI powered ticketing helpdesk system that categorizes, prioritize, and route support requests instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => onEnter('login')}
                className="bg-blue-800 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-800 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-2 group"
              >
                Get Started <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-3xl blur-3xl opacity-20"></div>
            <div className="relative bg-slate-950 rounded-3xl p-6 shadow-2xl border border-slate-800 w-full min-h-[400px] flex flex-col">
             
              <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                </div>
                <div className="text-slate-500 text-xs font-mono">LIVE_TICKET_PROCESSOR</div>
              </div>

              
              <div className="space-y-4 flex-1">
                
                <div className={`transition-all duration-500 ${step >= 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                      <User size={16} className="text-slate-400" />
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl rounded-tl-none max-w-[80%]">
                      <p className="text-slate-300 text-sm">"The office printer is offline again. I tried restarting it but it's not working."</p>
                    </div>
                  </div>
                </div>

                
                {step >= 1 && (
                  <div className="flex justify-center animate-pulse">
                    <div className="bg-blue-600/10 text-blue-400 text-[10px] font-bold px-3 py-1 rounded-full border border-blue-600/20 uppercase tracking-widest">
                      AI Analyzing Logic...
                    </div>
                  </div>
                )}

              
                {step >= 2 && (
                  <div className="flex gap-3 justify-end">
                    <div className="bg-blue-600/20 border border-blue-500/30 p-3 rounded-2xl rounded-tr-none max-w-[80%]">
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles size={14} className="text-blue-400" />
                        <span className="text-blue-400 font-bold text-xs uppercase">SmartHelp Agent</span>
                      </div>
                      <p className="text-blue-100 text-sm">Detected category: <span className="font-bold text-white px-2 py-0.5 bg-orange-500/40 rounded text-[11px]">HARDWARE</span></p>
                      <p className="text-blue-200/70 text-xs mt-2">Routing to the on-site technician queue...</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center">
                      <Bot size={16} className="text-white" />
                    </div>
                  </div>
                )}

                
                {step >= 3 && (
                  <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl animate-in fade-in zoom-in duration-500">
                    <div className="flex items-center gap-2 text-emerald-400 mb-2">
                      <CheckCircle2 size={16} />
                      <span className="font-bold text-sm">AI Self-Fix Suggested</span>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      "I've identified this as a known IP conflict. I've sent a remote reset command to the print spooler. Check the printer in 60 seconds."
                    </p>
                  </div>
                )}
              </div>

        
              <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center">
                 <div className="flex items-center gap-2">
                   <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                   <span className="text-slate-500 text-[10px] uppercase font-bold tracking-tighter">System Online</span>
                 </div>
                 <div className="flex gap-1">
                   <div className="w-1.5 h-1.5 bg-slate-700 rounded-full"></div>
                   <div className="w-1.5 h-1.5 bg-slate-700 rounded-full"></div>
                   <div className="w-1.5 h-1.5 bg-slate-700 rounded-full"></div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </header>
     
      <footer className="py-12 border-t border-slate-100 text-center">
        <p className="text-slate-400 text-xs font-black uppercase tracking-[0.3em]">
          © 2025 SmartHelpAI • Intelligence in Every Ticket
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { X, Send, Bot, Sparkles, Clock, Loader2 } from 'lucide-react';

const TicketModal = ({ isOpen, onClose, onTicketCreated }) => {
  // ---------------- STATE ----------------
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [step, setStep] = useState('form');
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [ticketData, setTicketData] = useState(null);
  const chatEndRef = useRef(null);

  // ---------------- EFFECTS ----------------
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // ✅ RESET STATE WHEN MODAL CLOSES
  useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setDescription('');
      setMessages([]);
      setUserInput('');
      setTicketData(null);
      setStep('form');
      setIsTyping(false);
    }
  }, [isOpen]);

  

  // ❗ RETURN NULL ONLY AFTER ALL HOOKS
  if (!isOpen) return null;

  // ---------------- HANDLERS ----------------
  const startTriage = async (e) => {
    e.preventDefault();
    setStep('chat');
    setIsTyping(true);

    try {
      const res = await axios.post(
        'http://localhost:5000/api/tickets/create',
        { title, description }
      );

      if (res.data.stopFlow) {
        setMessages([{ role: 'assistant', content: res.data.aiSuggestion }]);
        setIsTyping(false);
        return;
      }

      setTicketData(res.data);
      setMessages([
        {
          role: 'assistant',
          content: res.data.aiSuggestion,
          category: res.data.category
        }
      ]);

      onTicketCreated(res.data);
    } catch {
      setMessages([{ role: 'assistant', content: 'Unable to connect to AI service.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const updatedMessages = [...messages, { role: 'user', content: userInput }];
    setMessages(updatedMessages);
    setUserInput('');
    setIsTyping(true);

    try {
      const res = await axios.post(
        'http://localhost:5000/api/tickets/chat',
        {
          messages: updatedMessages,
          category: ticketData?.category || 'General'
        }
      );

      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: res.data.content }
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Error communicating with AI.' }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-slate-950 rounded-[2.5rem] w-full max-w-2xl h-[650px] overflow-hidden shadow-2xl border border-slate-800 flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
          </div>
          <div className="text-slate-500 text-[10px] font-mono uppercase tracking-widest">
            SMART_RESOLVER_V2
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {step === 'form' ? (
            <form onSubmit={startTriage} className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Raising a New Ticket</h2>
              <input
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white"
                placeholder="Subject"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
              <textarea
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 h-40 text-white resize-none"
                placeholder="Tell me what's wrong..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
              />
              <button
  type="submit"
  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all"
>
  <div className="flex items-center justify-center gap-2">
  <Sparkles size={18} className="animate-pulse" />
  <span>Analyze & Solve</span>
</div>
</button>
            </form>
          ) : (
            <>
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl ${msg.role === 'assistant'
                    ? 'bg-slate-900 border border-slate-800 text-blue-50'
                    : 'bg-blue-600 text-white'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-2 text-blue-500">
                  <Loader2 className="animate-spin" /> AI is thinking...
                </div>
              )}
              <div ref={chatEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        {step === 'chat' && !isTyping && (
          <div className="p-6 border-t border-slate-800 bg-slate-900/50">
            <form onSubmit={sendMessage} className="flex gap-3">
              <input
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white"
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                placeholder="Type a message..."
              />
              <button className="bg-blue-600 p-3 rounded-xl">
                <Send className="text-white" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketModal;

// components/TicketModal.jsx - FIXED VERSION
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { X, Send, Bot, Sparkles, Clock, Loader2, BookOpen, Star, ThumbsUp, AlertCircle } from 'lucide-react';

const cleanAIReponse = (text) => {
  if (!text) return "";
  return text
    .replace(/\*\*/g, "") // Removes double asterisks
    .replace(/\*/g, "")   // Removes single asterisks
    .replace(/#/g, "")    // Removes hashes
    .trim();
};

const TicketModal = ({ isOpen, ticket, onClose, onTicketUpdated }) => {
  // ---------------- STATE ----------------
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [step, setStep] = useState('form');
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [ticketData, setTicketData] = useState(null);
  const [showKB, setShowKB] = useState(false);
  const chatEndRef = useRef(null);

  // ---------------- EFFECTS ----------------
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Load existing ticket data
  useEffect(() => {
    if (isOpen && ticket) {
      setTitle(ticket.title || '');
      setDescription(ticket.description || '');
      setStep('chat');
      setTicketData(ticket);
      setMessages(ticket.messages || []);
    }
  }, [isOpen, ticket]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setDescription('');
      setMessages([]);
      setUserInput('');
      setTicketData(null);
      setStep('form');
      setIsTyping(false);
      setShowKB(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // ---------------- HANDLERS ----------------
  const startTriage = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      alert('Please provide both a subject and description');
      return;
    }
    
    setStep('chat');
    setIsTyping(true);

    const userIssueMessage = { 
    role: 'user', 
    content: `**Subject:** ${title}\n\n**Description:** ${description}` 
  };
  setMessages([userIssueMessage]);

    try {
      // Create ticket and get AI categorization + solution
      const res = await axios.post(
        'http://localhost:5000/api/tickets/create',
        { title, description }
      );

      setTicketData(res.data);
      
      // Remove temporary message and show AI solution
      const solutionMessage = {
        role: 'assistant',
        content: res.data.aiSuggestion,
        metadata: {
          category: res.data.category,
          priority: res.data.priority,
          confidence: res.data.confidence,
          department: res.data.department
        }
      };
      
      setMessages([userIssueMessage, solutionMessage]);
      setIsTyping(false);

      if (onTicketUpdated) {
        onTicketUpdated();
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      setMessages([
        userIssueMessage,
        { 
        role: 'assistant', 
        content: '❌ I apologize, but I\'m having trouble connecting to the AI service. Please check your API key configuration and try again.\n\n**Troubleshooting:**\n1. Verify OPENROUTER_API_KEY is set in your .env file\n2. Check your internet connection\n3. Try again in a few moments' 
      }]);
      setIsTyping(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isTyping) return;

    const newUserMessage = { role: 'user', content: userInput };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setUserInput('');
    setIsTyping(true);

    try {
      const res = await axios.post(
        'http://localhost:5000/api/tickets/chat',
        {
          messages: updatedMessages,
          category: ticketData?.category || 'General',
          ticketId: ticketData?._id
        }
      );

      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: res.data.content }
      ]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'I\'m having trouble processing your message. Please try again or click "Escalate to Human" for immediate assistance.' }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const escalateToHuman = async () => {
    if (!ticketData?._id) return;
    
    try {
      await axios.patch(`http://localhost:5000/api/tickets/${ticketData._id}/escalate`);
      setMessages(prev => [
        ...prev,
        { 
          role: 'assistant', 
          content: '✅ Your ticket has been escalated to a human agent. They will contact you shortly via email or phone.' 
        }
      ]);
      if (onTicketUpdated) onTicketUpdated();
    } catch (error) {
      console.error('Escalation error:', error);
    }
  };

  const resolveTicket = async () => {
    if (!ticketData?._id) return;
    
    try {
      await axios.patch(`http://localhost:5000/api/tickets/${ticketData._id}/close`);
      setMessages(prev => [
        ...prev,
        { 
          role: 'assistant', 
          content: '✅ Great! I\'m glad I could help. This ticket has been marked as resolved. If you need further assistance, feel free to create a new ticket.' 
        }
      ]);
      if (onTicketUpdated) onTicketUpdated();
      
      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Close ticket error:', error);
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-slate-950 rounded-[2.5rem] w-full max-w-4xl h-[700px] overflow-hidden shadow-2xl border border-slate-800 flex">
        
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-4 border-b border-slate-800 bg-slate-900/50">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
            </div>
            <div className="text-slate-500 text-[10px] font-mono uppercase tracking-widest flex items-center gap-2">
              {ticketData && (
                <>
                  <span className={`px-2 py-0.5 rounded font-bold ${
                    ticketData.priority === 'Critical' ? 'bg-red-500/20 text-red-400' :
                    ticketData.priority === 'High' ? 'bg-orange-500/20 text-orange-400' :
                    ticketData.priority === 'Medium' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-slate-500/20 text-slate-400'
                  }`}>
                    {ticketData.priority}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-bold">
                    {ticketData.category}
                  </span>
                </>
              )}
              SMART_RESOLVER_V2
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            {step === 'form' ? (
              <form onSubmit={startTriage} className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Create New Ticket</h2>
                  <p className="text-sm text-slate-400">Our AI will analyze and categorize your issue automatically</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Subject</label>
                  <input
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description of the issue"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                  <textarea
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 h-40 text-white placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe your issue in detail... The more information you provide, the better I can help!"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/20"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Sparkles size={18} className="animate-pulse" />
                    <span>Analyze & Solve with AI</span>
                  </div>
                </button>
              </form>
            ) : (
              <>
                {/* Ticket Info Banner */}
                {ticketData && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-white font-bold text-lg">{ticketData.title || title}</h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Ticket ID: {ticketData._id?.slice(-8)} • Assigned to: {ticketData.department || 'AI Agent'}
                        </p>
                      </div>
                      {ticketData.confidence !== undefined && (
                        <div className="text-right ml-4">
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider">AI Confidence</p>
                          <p className="text-2xl font-bold text-blue-400">{Math.round(ticketData.confidence * 100)}%</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Messages */}
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-4 duration-300`}>
                    <div className={`max-w-[85%] ${
                      msg.role === 'assistant'
                        ? 'space-y-0'
                        : ''
                    }`}>
                      {msg.role === 'assistant' && (
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                            <Bot size={16} className="text-white" />
                          </div>
                          <span className="text-xs text-slate-400 font-bold">AI Support Assistant</span>
                        </div>
                      )}
                      
                      <div className={`p-4 rounded-2xl ${
                        msg.role === 'assistant'
                          ? 'bg-slate-900 border border-slate-800 text-blue-50 ml-10'
                          : 'bg-blue-600 text-white'
                      }`}>
                        <div className="text-sm leading-relaxed whitespace-pre-line">{cleanAIReponse(msg.content)}</div>
                        
                        {msg.metadata && i === 0 && (
                          <div className="mt-4 pt-4 border-t border-slate-800">
                            <div className="flex flex-wrap gap-2 mb-2">
                              <span className="text-[10px] px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full font-bold">
                                📁 {msg.metadata.category}
                              </span>
                              <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${
                                msg.metadata.priority === 'Critical' ? 'bg-red-500/20 text-red-300' :
                                msg.metadata.priority === 'High' ? 'bg-orange-500/20 text-orange-300' :
                                msg.metadata.priority === 'Medium' ? 'bg-blue-500/20 text-blue-300' :
                                'bg-slate-500/20 text-slate-300'
                              }`}>
                                ⚡ {msg.metadata.priority}
                              </span>
                              <span className="text-[10px] px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded-full font-bold">
                                👥 {msg.metadata.department}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 italic">
                              AI Confidence: {Math.round((msg.metadata.confidence || 0) * 100)}%
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
                      <Bot size={18} className="text-blue-400" />
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          {step === 'chat' && (
            <div className="p-6 border-t border-slate-800 bg-slate-900/50">
              <form onSubmit={sendMessage} className="flex gap-3">
                <input
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={userInput}
                  onChange={e => setUserInput(e.target.value)}
                  placeholder="Type your message..."
                  disabled={isTyping}
                />
                <button 
                  type="submit"
                  disabled={isTyping || !userInput.trim()}
                  className="bg-blue-600 p-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="text-white" size={20} />
                </button>
              </form>

              {/* Quick Actions */}
              {ticketData && ticketData.status !== 'Closed' && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  <button
                    onClick={resolveTicket}
                    className="text-xs px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-1 font-medium"
                  >
                    <span>✓</span> Issue Resolved
                  </button>
                  <button
                    onClick={escalateToHuman}
                    className="text-xs px-3 py-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-1 font-medium"
                  >
                    <AlertCircle size={12} /> Escalate to Human
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketModal;
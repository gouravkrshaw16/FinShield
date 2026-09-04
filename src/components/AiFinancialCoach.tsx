import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  ShieldCheck, 
  X, 
  Lightbulb, 
  Minimize2, 
  Maximize2,
  HelpCircle,
  Database,
  ChevronDown
} from 'lucide-react';
import { UserProfile } from '../types';
import { calculateOverallScore } from '../data/mockProfiles';
import { dbService } from '../lib/databaseService';

interface AiFinancialCoachProps {
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onToggleOpen: () => void;
  initialPrompt?: string;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export const AiFinancialCoach: React.FC<AiFinancialCoachProps> = ({
  profile,
  isOpen,
  onClose,
  onToggleOpen,
  initialPrompt,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  const overallScore = calculateOverallScore(profile.scorePillars);
  const monthlySurplus = profile.monthlyInflow - profile.monthlyOutflow;

  useEffect(() => {
    if (isOpen) {
      // Fetch persisted chat history from Firestore for this profile
      dbService.getChatHistory(profile.id).then((history) => {
        if (history && history.length > 0) {
          setMessages(history.map(h => ({
            id: h.id || `msg-${Math.random()}`,
            sender: h.sender,
            text: h.text,
            timestamp: h.timestamp
          })));
        } else if (messages.length === 0) {
          const welcomeText = `Hi ${profile.name}! 👋 I am your **FinShield Financial Health Coach**. 

Ask me anything about improving your **${overallScore}/100** score, accessing 0% interest public grants, or building your **₹${profile.fundingNeed.amount.toLocaleString('en-IN')}** goal without high-interest payday loans.`;

          setMessages([
            {
              id: 'welcome',
              sender: 'ai',
              text: welcomeText,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        }
      });

      if (initialPrompt) {
        handleSendMessage(initialPrompt);
      }
    }
  }, [isOpen, profile.id]);

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    // Save user message to Firestore
    dbService.saveChatMessage(profile.id, 'user', textToSend);

    try {
      const res = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          profileContext: {
            name: profile.name,
            personaType: profile.personaType,
            monthlyInflow: profile.monthlyInflow,
            monthlyOutflow: profile.monthlyOutflow,
            savingsCapacity: monthlySurplus,
            score: overallScore,
            primaryGoal: `${profile.fundingNeed.purpose} (₹${profile.fundingNeed.amount})`,
          },
        }),
      });

      let replyText = "";
      if (res.ok) {
        const data = await res.json();
        replyText = data.reply || "I'm here to support your responsible financial journey.";
      } else {
        const data = await res.json().catch(() => ({}));
        replyText = data.reply || "Prioritize on-time bill payments, maintain a liquid emergency reserve, and explore zero-interest peer savings or public subsidy grants before taking debt.";
      }

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
      // Persist AI reply to Firestore
      dbService.saveChatMessage(profile.id, 'ai', replyText);
    } catch (err) {
      console.error('Coach Chat Error:', err);
      const fallbackText = "Prioritize on-time bill payment and building a 1-month liquid emergency cushion over taking commercial payday debt.";
      const errorMsg: Message = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
      dbService.saveChatMessage(profile.id, 'ai', fallbackText);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    `How to boost score to 90+?`,
    `Is taking an EMI loan safe for me?`,
    `Best subsidy grants for my goal?`,
    `60-day debt-free plan`
  ];

  return (
    <>
      {/* Floating Bottom AI Coach Launcher Button (Small Icon at the bottom right) */}
      <div className="fixed bottom-4 sm:bottom-6 right-3 sm:right-6 z-40 flex items-center gap-2">
        {!isOpen && (
          <button
            onClick={onToggleOpen}
            className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-sm shadow-xl shadow-indigo-950/80 border border-indigo-400/30 transition-all transform hover:scale-105 active:scale-95 cursor-pointer shrink-0"
            aria-label="Open AI Financial Coach"
          >
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-400"></span>
            </span>
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse shrink-0" />
            <span className="tracking-wide">AI Coach</span>
            <span className="hidden sm:inline-block text-xs bg-indigo-900/60 px-2.5 py-0.5 rounded-full text-indigo-200 border border-indigo-400/20 font-medium">
              Online
            </span>
          </button>
        )}
      </div>

      {/* Small Pop-up Window for AI Coach (Anchored to bottom right) */}
      {isOpen && (
        <div 
          className={`fixed bottom-3 sm:bottom-6 right-2 sm:right-6 z-50 flex flex-col bg-slate-900 border border-slate-700/90 rounded-3xl shadow-2xl overflow-hidden transition-all duration-200 ease-out animate-in slide-in-from-bottom-5 max-w-[calc(100vw-1rem)] sm:max-w-[500px] ${
            isExpanded 
              ? 'w-[calc(100vw-1rem)] sm:w-[500px] h-[calc(100dvh-2rem)] max-h-[850px]' 
              : 'w-[calc(100vw-1rem)] sm:w-[420px] h-[min(560px,calc(100dvh-2rem))] max-h-[calc(100dvh-2rem)]'
          }`}
        >
          {/* Header */}
          <div className="px-4 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                <Sparkles className="w-4.5 h-4.5 text-indigo-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">AI Financial Coach</h4>
                  <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30 uppercase tracking-wider">
                    Live
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Fair Lending & Non-Predatory Guidance
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                title={isExpanded ? 'Minimize size' : 'Expand window'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close AI Coach"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 min-h-0 p-4 overflow-y-auto space-y-3.5 text-sm bg-slate-900/90 scrollbar-thin">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-600/30 text-indigo-300 flex items-center justify-center shrink-0 mt-0.5 border border-indigo-500/30">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-xs text-right'
                      : 'bg-slate-800 text-slate-100 border border-slate-700/80 rounded-bl-xs text-left shadow-sm'
                  }`}
                >
                  <div className="whitespace-pre-wrap text-xs sm:text-sm">{msg.text}</div>
                  <div className={`text-[10px] mt-1.5 font-medium ${msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {msg.timestamp}
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-slate-700 text-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2.5 text-xs text-slate-400">
                <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 italic text-xs">
                  Analyzing ethical options...
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Quick Prompts Horizontal Pills */}
          <div className="px-3.5 py-2 bg-slate-950/90 border-t border-slate-800/70 overflow-x-auto flex gap-2 scrollbar-none shrink-0">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer font-medium"
              >
                <Lightbulb className="w-3 h-3 text-amber-400 shrink-0" />
                <span>{prompt}</span>
              </button>
            ))}
          </div>

          {/* Chat Input Footer */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask about score, grants, or plans..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50 shrink-0 cursor-pointer shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      )}
    </>
  );
};

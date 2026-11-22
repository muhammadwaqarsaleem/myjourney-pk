import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  X,
  Send,
  Compass,
  ArrowRight,
  Bot,
  User,
  AlertCircle,
} from 'lucide-react';
import { api } from '../../api/axios';

const STARTER_PROMPTS = [
  'Best time for Hunza?',
  '3-day Lahore food & heritage',
  'Hotels in Skardu',
  'Is it safe for solo travel?',
];

/**
 * Parses markdown bold (**text**) and markdown links ([text](url)) safely.
 * Only renders <Link to={url}> when url is an internal path (url.startsWith('/') && !url.startsWith('//')).
 * Otherwise, renders as plain escaped text—neutralizing javascript: and external injection vectors.
 * NEVER uses dangerouslySetInnerHTML or innerHTML.
 */
function parseSafeLineTokens(text, onLinkClick) {
  const tokens = [];
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(text.substring(lastIndex, match.index));
    }

    const label = match[1];
    const rawUrl = match[2].trim();

    // Mandatory Security Check: internal relative route only
    const isSafeInternalUrl = rawUrl.startsWith('/') && !rawUrl.startsWith('//');

    if (isSafeInternalUrl) {
      tokens.push(
        <Link
          key={`link-${match.index}`}
          to={rawUrl}
          onClick={onLinkClick}
          className="font-bold text-brand-emerald underline hover:text-emerald-800 transition inline-flex items-center gap-0.5"
        >
          <span>{label}</span>
          <ArrowRight className="w-3 h-3 inline-block" />
        </Link>
      );
    } else {
      tokens.push(`${label} (${rawUrl})`);
    }

    lastIndex = linkRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    tokens.push(text.substring(lastIndex));
  }

  // Format bold (**text**) in text segments
  return tokens.map((tok, idx) => {
    if (typeof tok !== 'string') return tok;
    if (!tok.includes('**')) return <span key={idx}>{tok}</span>;

    const parts = tok.split('**');
    return (
      <span key={idx}>
        {parts.map((part, pIdx) =>
          pIdx % 2 === 1 ? (
            <strong key={pIdx} className="font-bold text-brand-charcoal">
              {part}
            </strong>
          ) : (
            part
          )
        )}
      </span>
    );
  });
}

function renderSafeMessageContent(content, onLinkClick) {
  if (!content) return null;

  const paragraphs = content.split(/\n\n+/);

  return paragraphs.map((para, paraIdx) => {
    const lines = para.split(/\n/);

    return (
      <div key={paraIdx} className="mb-2.5 last:mb-0 leading-relaxed text-xs sm:text-sm">
        {lines.map((line, lineIdx) => {
          const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
          const lineContent = isBullet ? line.trim().replace(/^[-*]\s+/, '') : line;

          return (
            <div
              key={lineIdx}
              className={
                isBullet
                  ? 'flex items-start gap-1.5 my-1 pl-1'
                  : 'my-0.5'
              }
            >
              {isBullet && (
                <span className="text-brand-emerald font-bold shrink-0 mt-0.5">•</span>
              )}
              <div className="flex-1">
                {parseSafeLineTokens(lineContent, onLinkClick)}
              </div>
            </div>
          );
        })}
      </div>
    );
  });
}

export default function FloatingAiWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "As-salamu alaykum! I'm your AI Travel Concierge for Pakistan.\n\nAsk me about road conditions, cultural tips, or partner stays—or explore our [Travel Blogs](/blogs) and [Itinerary Planner](/planner)!",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatError, setChatError] = useState('');

  const messagesEndRef = useRef(null);
  const drawerRef = useRef(null);
  const messageIdCounter = useRef(0);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isTyping) return;

    setChatError('');
    setInputMessage('');

    messageIdCounter.current += 1;
    const userMsg = {
      id: `user-${messageIdCounter.current}`,
      sender: 'user',
      text: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      // Build conversation history for context
      const conversationHistory = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          text: m.text,
        }));

      const response = await api.post('/ai/chat', {
        message: query,
        conversationHistory,
      });

      const replyText =
        response.data?.reply ||
        'I am here to guide your journey. Let me know where in Pakistan you wish to go!';

      messageIdCounter.current += 1;
      const assistantMsg = {
        id: `assistant-${messageIdCounter.current}`,
        sender: 'assistant',
        text: replyText,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setChatError(
        err.response?.data?.message || 'Unable to connect to AI Guide. Please try again.'
      );
      messageIdCounter.current += 1;
      const errorMsg = {
        id: `err-${messageIdCounter.current}`,
        sender: 'assistant',
        text: "I apologize, but I encountered a momentary hiccup. You can still plan custom routes on our [Itinerary Planner](/planner) or browse verified stays on [Hotels Directory](/hotels).",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSendMessage(inputMessage);
  };

  const handleStarterClick = (prompt) => {
    handleSendMessage(prompt);
  };

  const closeDrawer = () => {
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Action Trigger Button (min 52x52px) */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Travel Assistant"
          className="min-h-[52px] min-w-[52px] px-4 py-3 bg-brand-emerald hover:bg-emerald-800 text-white rounded-full shadow-xl flex items-center gap-2.5 transition-all duration-200 hover:scale-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-emerald/40"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-brand-mint animate-pulse" />
          </div>
          <span className="font-bold text-xs tracking-wide pr-1 hidden sm:inline">
            Ask AI Guide
          </span>
        </button>
      )}

      {/* Accessible Slide-Up Drawer Dialog */}
      {isOpen && (
        <div
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-label="AI Travel Assistant"
          className="w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-brand-emerald to-slate-900 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-brand-mint">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                  <span>AI Travel Guide</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                </h3>
                <p className="text-[11px] text-slate-200">Grounded Concierge for Pakistan</p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeDrawer}
              aria-label="Close AI Travel Assistant"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Starter Chips */}
          <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 pl-1">
              Quick:
            </span>
            {STARTER_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleStarterClick(prompt)}
                className="text-[11px] font-semibold text-slate-700 bg-white hover:bg-brand-sand hover:text-brand-emerald border border-slate-200/80 px-2.5 py-1 rounded-full whitespace-nowrap transition shrink-0 min-h-[32px] flex items-center"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                      isUser
                        ? 'bg-brand-emerald text-white font-bold'
                        : 'bg-brand-sand text-brand-emerald'
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Compass className="w-4 h-4" />}
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 shadow-xs ${
                      isUser
                        ? 'bg-brand-emerald text-white rounded-tr-none'
                        : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-none'
                    }`}
                  >
                    {isUser ? (
                      <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                        {msg.text}
                      </p>
                    ) : (
                      renderSafeMessageContent(msg.text, closeDrawer)
                    )}
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 text-slate-400 text-xs pl-2">
                <div className="w-6 h-6 rounded-lg bg-brand-sand text-brand-emerald flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-bounce" />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-bounce"
                    style={{ animationDelay: '0.4s' }}
                  />
                  <span className="text-[11px] text-slate-500 font-medium ml-1">
                    Consulting Pakistan travel database...
                  </span>
                </div>
              </div>
            )}

            {chatError && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{chatError}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 border-t border-slate-200 bg-white shrink-0">
            <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about valleys, passes, or stays..."
                disabled={isTyping}
                aria-label="Type your tourism inquiry"
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-brand-charcoal placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-emerald min-h-[44px]"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isTyping}
                aria-label="Send inquiry"
                className="min-h-[44px] min-w-[44px] px-3.5 py-2.5 rounded-xl bg-brand-emerald hover:bg-emerald-800 disabled:bg-slate-200 text-white font-bold transition flex items-center justify-center shrink-0"
              >
                <Send className="w-4 h-4 text-brand-mint" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

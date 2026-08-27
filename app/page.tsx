'use client';

import Image from 'next/image';
import React, { useState, useRef, useEffect } from 'react';

// API Response Interfaces matching latest backend payload
interface APIVerseSource {
  text: string;
  chapter: number;
  verse: number;
  source: string;
  sloka?: string; // Original Sanskrit text
}

interface APIResponse {
  answer: string;
  sources?: APIVerseSource[];
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  sources?: APIVerseSource[];
  isError?: boolean;
}

// Utility function to clean "Based on the provided context," prefixes
const cleanPrefix = (text: string): string => {
  let cleaned = text.replace(/Based on the provided context,?\s*/gi, '');
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  return cleaned;
};

// Utility function to dynamically render markdown bold "**text**" into React elements
const renderFormattedText = (text: string) => {
  const cleanedText = cleanPrefix(text);
  const parts = cleanedText.split(/\*\*([\s\S]*?)\*\*/g);

  return parts.map((part, index) => {
    // Odd indexes represent content originally enclosed in double asterisks (**)
    if (index % 2 === 1) {
      return (
        <strong key={index} className="font-bold text-stone-900">
          {part}
        </strong>
      );
    }
    return part;
  });
};

export default function BhagavadGita() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested questions
  const suggestions = [
    "How can I control my anger?",
    "How should I deal with failure?",
    "How can I control my desires?",
    "What does Krishna say about attachment?"
  ];

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const toggleSources = (messageId: string) => {
    setExpandedSources((prev) => ({
      ...prev,
      [messageId]: !prev[messageId],
    }));
  };

  const handleAsk = async (questionText: string) => {
    if (!questionText.trim()) return;

    // Add user question to timeline
    const userMsgId = `user-${Date.now()}`;
    const newMessages: Message[] = [
      ...messages,
      { id: userMsgId, role: 'user', text: questionText }
    ];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // API call to local backend service
      const response = await fetch('https://ask-bhagavad-gita-api.vercel.app/chat', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: questionText }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }

      const data: APIResponse = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: data.answer,
          sources: data.sources || [],
        }
      ]);
    } catch (err: any) {
      console.error(err);

      // Connection failure handling
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          text: `Unable to establish a connection to the scripture database. Please ensure the local service is running.\n\n(Details: ${err.message})`,
          isError: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAsk(input);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-stone-800 flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">

      {/* Header Banner */}
      <header className="border-b border-amber-900/10 bg-white/60 backdrop-blur-md sticky top-0 z-30 py-4 px-4 sm:px-6 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 mx-auto sm:mx-0">
            {/* Elegant representation of Lord Krishna's Peacock Feather */}
            <svg className="w-10 h-10 text-amber-600" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 95 C 45 75, 25 50, 25 35 C 25 15, 45 5, 50 5 C 55 5, 75 15, 75 35 C 75 50, 55 75, 50 95 Z" fill="url(#featherGrad)" opacity="0.15" />
              <path d="M50 95 C 45 75, 25 50, 25 35 C 25 15, 45 5, 50 5 C 55 5, 75 15, 75 35 C 75 50, 55 75, 50 95 Z" stroke="#B45309" strokeWidth="1" strokeDasharray="3 3" />

              <path d="M50 95 C 51 70, 50 40, 50 5" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" />

              <ellipse cx="50" cy="35" rx="18" ry="24" fill="#D97706" opacity="0.3" />
              <ellipse cx="50" cy="35" rx="13" ry="18" fill="#047857" opacity="0.6" />
              <ellipse cx="50" cy="35" rx="8" ry="11" fill="#1D4ED8" />
              <circle cx="49" cy="33" r="4" fill="#60A5FA" />

              <path d="M50 65 Q 35 55, 30 40" stroke="#047857" strokeWidth="1" opacity="0.5" />
              <path d="M50 65 Q 65 55, 70 40" stroke="#047857" strokeWidth="1" opacity="0.5" />
              <path d="M50 50 Q 33 42, 28 30" stroke="#D97706" strokeWidth="1" opacity="0.5" />
              <path d="M50 50 Q 67 42, 72 30" stroke="#D97706" strokeWidth="1" opacity="0.5" />

              <defs>
                <radialGradient id="featherGrad" cx="50%" cy="35%" r="50%">
                  <stop offset="0%" stopColor="#1E3A8A" />
                  <stop offset="40%" stopColor="#047857" />
                  <stop offset="70%" stopColor="#D97706" />
                  <stop offset="100%" stopColor="#FAF7F2" />
                </radialGradient>
              </defs>
            </svg>

            <div>
              <div className="text-amber-700 font-serif text-sm tracking-wider font-semibold">
                भगवद् गीता
              </div>
              <h1 className="text-lg sm:text-xl font-serif font-bold tracking-wide text-stone-900">
                ASK BHAGAVAD GITA
              </h1>
            </div>
          </div>

          <div className="text-right hidden sm:block text-xs text-stone-500 font-serif italic">
            "Wisdom of the Divine Song"
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-between">

        {/* Conversation Timeline */}
        <div className="flex-1 space-y-6 mb-8">

          {/* Welcome Screen */}
          {messages.length === 0 && (
            <div className="py-12 px-6 text-center rounded-3xl bg-white/50 border border-amber-900/5 shadow-sm animate-fade-in mt-4">

              {/* Peacock feather core visual */}
              <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-200/40 shadow-inner">
                <Image src="/feather.jpg" alt="feather" width={200} height={100} className='rounded-full' />
              </div>

              <h2 className="text-xl sm:text-2xl font-serif font-medium text-stone-900 mb-3">
                Seek Eternal Guidance
              </h2>

              <p className="text-base text-stone-700 max-w-xl mx-auto leading-relaxed mb-6">
                Ask any problems and doubts in your mind. The Bhagavad Gita has all the answers spoken to Arjuna.
              </p>

              <div className="text-xs text-amber-800 bg-amber-50 inline-block px-4 py-2 rounded-full border border-amber-200/60 font-medium tracking-wide">
                Grounded in sacred Chapter & Verse references.
              </div>
            </div>
          )}

          {/* Render Timeline Messages */}
          {messages.map((msg) => {
            const isExpanded = !!expandedSources[msg.id];
            return (
              <div key={msg.id} className="space-y-4">

                {/* User Entry */}
                {msg.role === 'user' && (
                  <div className="flex justify-end">
                    <div className="bg-stone-800 text-stone-100 px-4 py-3 rounded-2xl rounded-tr-none shadow-sm max-w-[85%] text-sm font-medium">
                      {msg.text}
                    </div>
                  </div>
                )}

                {/* Response Block */}
                {msg.role === 'assistant' && (
                  <div className="space-y-4 animate-fade-in">

                    {/* Narrative Response */}
                    <div className={`p-5 rounded-2xl bg-white border shadow-sm ${msg.isError ? 'border-amber-200 bg-amber-50/20' : 'border-stone-200'}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-5 h-5 rounded-full bg-amber-700 flex items-center justify-center text-white text-[9px] font-bold">
                          ॐ
                        </div>
                        <span className="text-[10px] uppercase tracking-widest font-semibold text-stone-500">
                          Answers based on the shlokas from Bhagavad Gita
                        </span>
                      </div>

                      <p className="text-sm text-stone-800 leading-relaxed whitespace-pre-wrap font-sans">
                        {renderFormattedText(msg.text)}
                      </p>

                      {/* Read More / Toggle scriptural references button */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-stone-100 flex justify-start">
                          <button
                            onClick={() => toggleSources(msg.id)}
                            className="text-xs text-amber-800 hover:text-amber-950 font-medium flex items-center gap-1 transition-colors"
                          >
                            <span>{isExpanded ? 'Hide references' : 'Read references...'}</span>
                            <svg
                              className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="2.5"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Collapsible scriptural reference display */}
                    {msg.sources && msg.sources.length > 0 && isExpanded && (
                      <div className="space-y-4 ml-2 sm:ml-4 border-l-2 border-amber-600/25 pl-4 py-1 animate-fade-in">
                        <div className="text-[10px] uppercase tracking-wider font-semibold text-amber-900/80 mb-2">
                          Grounded Verses & Commentaries
                        </div>

                        {msg.sources.map((src, index) => (
                          <div key={index} className="bg-white border border-stone-200/80 rounded-xl p-4 space-y-3 shadow-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-serif font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-700/15">
                                📖 Chapter {src.chapter} · Verse {src.verse}
                              </span>
                              <span className="text-[10px] text-stone-400 font-medium tracking-wide uppercase">
                                {src.source}
                              </span>
                            </div>

                            {/* Optional Original Sanskrit Shloka rendering */}
                            {src.sloka && (
                              <div className="bg-[#FAF7F2]/60 rounded-lg p-3 border border-amber-900/5">
                                <p className="text-center font-serif text-sm text-stone-800 leading-relaxed font-semibold whitespace-pre-line italic">
                                  {src.sloka}
                                </p>
                              </div>
                            )}

                            <div className="border-t border-stone-100 pt-3">
                              <p className="text-xs text-stone-750 leading-relaxed whitespace-pre-wrap text-stone-600">
                                {src.text}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                  </div>
                )}
              </div>
            );
          })}

          {/* Loading status */}
          {isLoading && (
            <div className="flex items-center space-x-2 text-stone-500 py-4 animate-pulse">
              <div className="w-2 h-2 bg-amber-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-amber-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-2 h-2 bg-amber-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              <span className="text-xs font-serif italic text-stone-600 pl-1">Finding answers in the Bhagavad Gita...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Action Tray */}
        <div className="space-y-4">

          {/* Query Suggestion chips */}
          <div className="space-y-2">
            <span className="text-xs text-stone-500 uppercase tracking-widest font-semibold block">
              Inquire about:
            </span>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAsk(sug)}
                  disabled={isLoading}
                  className="text-xs bg-white hover:bg-amber-50/70 hover:text-amber-950 text-stone-700 px-3.5 py-2 rounded-xl border border-stone-200/80 transition-all duration-150 text-left disabled:opacity-50 shadow-xs"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Input Bar */}
          <div className="relative flex items-center bg-white rounded-2xl shadow-sm border border-stone-200 p-2 focus-within:ring-2 focus-within:ring-amber-500/25 focus-within:border-amber-600 transition-all">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder="Ask anything from the Bhagavad Gita..."
              className="flex-1 bg-transparent py-2.5 px-3 outline-none text-sm placeholder:text-stone-400 text-stone-900 disabled:opacity-75"
            />

            <button
              onClick={() => handleAsk(input)}
              disabled={!input.trim() || isLoading}
              className="bg-amber-700 hover:bg-amber-800 text-white p-2.5 rounded-xl transition-all flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Send query"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>

          {/* Humble Scriptural Compliancy Footer */}
          <p className="text-[10px] text-center text-stone-400 leading-relaxed max-w-lg mx-auto">
            This workspace utilizes standard scripture translation mappings. In alignment with pure teachings, responses remain fully constrained inside our Bhagavad Gita sources.
          </p>
        </div>

      </main>
    </div>
  );
}
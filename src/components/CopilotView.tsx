import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { apiClient } from '../services/apiClient';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Copy, 
  Check, 
  Globe2, 
  BookOpen, 
  FileEdit, 
  ShieldCheck, 
  ArrowRight,
  MessageSquare
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const CopilotView: React.FC = () => {
  const { activeProjectDetail, activeProjectId, showToast, language, setLanguage, t } = useApp();
  const project = activeProjectDetail?.project;

  const getWelcomeText = (lang: string) => {
    if (lang === 'hi') {
      return `नमस्ते विक्रम! मैं आपका AI एक्सपोर्ट कोपायलट हूँ। मेरे पास आपके सक्रिय कंसाइनमेंट की पूरी जानकारी है: **${project?.name || 'EU Autumn Batch'}** (${project?.productName}, HS कोड: **${project?.hsCode || '4202.21'}**) गंतव्य: **${project?.destinationPort}, ${project?.destinationCountry}**। आज मैं आपकी किस प्रकार सहायता कर सकता हूँ?`;
    }
    if (lang === 'mr') {
      return `नमस्कार विक्रम! मी तुमचा AI निर्यात कोपायलट आहे. मला तुमच्या सक्रिय कंसाइनमेंटची पूर्ण माहिती आहे: **${project?.name || 'EU Autumn Batch'}** (${project?.productName}, HS कोड: **${project?.hsCode || '4202.21'}**) गंतव्य: **${project?.destinationPort}, ${project?.destinationCountry}**। आज आंतरराष्ट्रीय निर्यातीत मी तुम्हाला कशी मदत करू शकतो?`;
    }
    return `Namaste Vikram! I am your AI Export Copilot. I have full context on your active consignment: **${project?.name || 'EU Autumn Batch'}** (${project?.productName}, HS Code: **${project?.hsCode || '4202.21'}**) destined for **${project?.destinationPort}, ${project?.destinationCountry}**. How can I assist your cross-border operation today?`;
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      text: getWelcomeText(language),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // When language changes, update greeting if initial
  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].sender === 'assistant') {
        return [{
          id: '1',
          sender: 'assistant',
          text: getWelcomeText(language),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }];
      }
      return prev;
    });
  }, [language, project?.name]);

  const quickPrompts = language === 'hi' ? [
    'जर्मनी के लिए EU REACH क्रोमियम VI परीक्षण सीमाएं क्या हैं?',
    'सीमा शुल्क निकासी के लिए कौन से दस्तावेज़ आवश्यक हैं?',
    '90+ तत्परता स्कोर तक पहुँचने के लिए मुझे आगे क्या करना चाहिए?',
    'JNPT न्हावा शेवा से हैम्बर्ग तक समुद्री माल ढुलाई का खर्च कितना होगा?'
  ] : language === 'mr' ? [
    'जर्मनीसाठी EU REACH चाचणी नियम आणि मर्यादा काय आहेत?',
    'सीमाशुल्क मंजुरीसाठी कोणती कागदपत्रे आवश्यक आहेत?',
    '90+ निर्यात सज्जता मिळवण्यासाठी मी पुढे काय करावे?',
    'JNPT न्हावा शेवा ते हॅम्बुर्ग सागरी मालवाहतूक खर्च किती होईल?'
  ] : [
    'Explain EU REACH Chromium VI limits for leather goods in Germany',
    'What documents are missing for customs clearance?',
    'What should I do next to reach 90+ readiness?',
    'How much will sea freight from JNPT to Hamburg cost?'
  ];

  const handleSend = async (queryToSend?: string) => {
    const query = queryToSend || inputQuery;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryToSend) setInputQuery('');
    setIsThinking(true);

    try {
      const res = await apiClient.askCopilot(
        query.trim(),
        activeProjectId || undefined,
        language === 'hi' ? 'Hindi' : language === 'mr' ? 'Marathi' : 'English'
      );

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: res.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      showToast(err.message || 'Error communicating with AI Copilot');
    } finally {
      setIsThinking(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Copied response to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getPlaceholderText = () => {
    if (language === 'hi') return 'हिंदी में पूछें... (जैसे: JNPT पर LEO क्लीयरेंस के लिए क्या आवश्यक है?)';
    if (language === 'mr') return 'मराठीत विचारा... (उदा: JNPT येथे LEO मंजुरीसाठी काय आवश्यक आहे?)';
    return 'Ask in English... (e.g. "What is required for LEO clearance at JNPT?")';
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto h-[calc(100vh-64px)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200 gap-3 shrink-0">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-teal-800 text-white flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-teal-200" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
              AI Export Copilot
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Context: {project?.name} ({project?.destinationCountry}) • DGFT Foreign Trade Policy 2023
          </p>
        </div>

        {/* Language Switcher */}
        <div className="flex items-center space-x-1 bg-stone-100 p-1 rounded-xl text-xs font-semibold">
          <Globe2 className="w-3.5 h-3.5 text-stone-500 ml-1.5 mr-1" />
          <button
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-1 rounded-lg transition ${language === 'en' ? 'bg-white text-stone-900 shadow-2xs font-bold' : 'text-stone-600 hover:text-stone-900'}`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage('hi')}
            className={`px-2.5 py-1 rounded-lg transition ${language === 'hi' ? 'bg-white text-stone-900 shadow-2xs font-bold' : 'text-stone-600 hover:text-stone-900'}`}
          >
            हिंदी
          </button>
          <button
            onClick={() => setLanguage('mr')}
            className={`px-2.5 py-1 rounded-lg transition ${language === 'mr' ? 'bg-white text-stone-900 shadow-2xs font-bold' : 'text-stone-600 hover:text-stone-900'}`}
          >
            मराठी
          </button>
        </div>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                isUser ? 'bg-stone-900 text-white' : 'bg-teal-800 text-white'
              }`}>
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-teal-200" />}
              </div>

              <div className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed ${
                isUser 
                  ? 'bg-stone-900 text-white' 
                  : 'bg-white border border-stone-200 text-stone-800 shadow-2xs'
              }`}>
                <div className="flex items-center justify-between mb-1 opacity-70 text-[10px]">
                  <span className="font-semibold">{isUser ? 'You' : 'ExportPilot AI'}</span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* Body formatting */}
                <div className="whitespace-pre-wrap space-y-2">
                  {msg.text}
                </div>

                {!isUser && (
                  <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-end">
                    <button
                      onClick={() => handleCopy(msg.text, msg.id)}
                      className="text-[10px] text-stone-400 hover:text-stone-700 flex items-center space-x-1"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isThinking && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-xl bg-teal-800 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-teal-200 animate-spin" />
            </div>
            <div className="bg-white border border-stone-200 rounded-2xl p-4 text-xs text-stone-500 shadow-2xs flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
              <span>Analyzing DGFT Foreign Trade Policy & Customs Directives...</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Suggested Quick Questions */}
      <div className="pt-2 pb-3 shrink-0">
        <div className="text-[10px] uppercase font-bold text-stone-400 mb-1.5">
          Frequently Consulted Directives:
        </div>
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              className="px-3 py-1.5 rounded-xl bg-white border border-stone-200 hover:border-teal-400 hover:bg-teal-50/50 text-[11px] text-stone-700 font-medium whitespace-nowrap transition shadow-2xs"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="pt-2 border-t border-stone-200 shrink-0">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={getPlaceholderText()}
            className="w-full pl-4 pr-12 py-3 text-xs rounded-2xl border border-stone-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-600 shadow-xs"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isThinking}
            className={`absolute right-2 p-2 rounded-xl transition ${
              inputQuery.trim() && !isThinking
                ? 'bg-teal-800 hover:bg-teal-700 text-white'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

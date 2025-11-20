import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User as UserIcon, Sparkles } from 'lucide-react';
import { AppTheme, Message } from '../types';
import { chatWithAssistant } from '../services/geminiService';

interface SmartAssistantProps {
  theme: AppTheme;
}

export const SmartAssistant: React.FC<SmartAssistantProps> = ({ theme }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Bonjour ! Je suis Lumina. Utilisez le générateur à gauche pour créer vos commandes "Do" et "Undo" pour Sunshine, ou demandez-moi comment configurer le bitrate, le HDR ou le Wake-on-LAN.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user' as const, text: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    const response = await chatWithAssistant(messages, input);
    
    setMessages([...newMessages, { role: 'model', text: response }]);
    setLoading(false);
  };

  const isSun = theme === AppTheme.SUNSHINE;

  return (
    <div className={`h-full flex flex-col rounded-2xl overflow-hidden border shadow-xl transition-colors duration-500 ${
      isSun ? 'bg-white border-orange-100' : 'bg-slate-900 border-indigo-900/50'
    }`}>
      {/* Header */}
      <div className={`p-4 border-b flex items-center gap-2 ${isSun ? 'bg-orange-50 border-orange-100' : 'bg-indigo-950/30 border-indigo-900'}`}>
        <Sparkles size={20} className={isSun ? 'text-orange-600' : 'text-indigo-400'} />
        <h2 className={`font-bold ${isSun ? 'text-gray-800' : 'text-white'}`}>Assistant Intelligent</h2>
      </div>

      {/* Chat Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4" ref={scrollRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.role === 'user' 
                ? (isSun ? 'bg-gray-200 text-gray-600' : 'bg-slate-700 text-slate-300')
                : (isSun ? 'bg-orange-100 text-orange-600' : 'bg-indigo-900 text-indigo-300')
            }`}>
              {msg.role === 'user' ? <UserIcon size={14} /> : <Bot size={14} />}
            </div>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
              msg.role === 'user'
                ? (isSun ? 'bg-gray-100 text-gray-800 rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tr-none')
                : (isSun ? 'bg-orange-50 text-gray-800 rounded-tl-none border border-orange-100' : 'bg-indigo-900/30 text-indigo-100 rounded-tl-none border border-indigo-900/50')
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isSun ? 'bg-orange-100' : 'bg-indigo-900'}`}>
              <Bot size={14} className={isSun ? 'text-orange-600' : 'text-indigo-300'} />
            </div>
            <div className={`p-3 rounded-2xl rounded-tl-none text-sm flex items-center gap-1 ${
              isSun ? 'bg-orange-50' : 'bg-indigo-900/30'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className={`p-4 border-t ${isSun ? 'bg-gray-50 border-gray-100' : 'bg-slate-900 border-slate-800'}`}>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Posez une question..."
            className={`flex-1 p-2 px-4 rounded-full border outline-none focus:ring-2 ${
              isSun 
                ? 'bg-white border-gray-200 focus:ring-orange-400 text-gray-800' 
                : 'bg-slate-800 border-slate-700 focus:ring-indigo-500 text-white placeholder-slate-500'
            }`}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className={`p-2 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              isSun
                ? 'bg-orange-500 text-white hover:bg-orange-600'
                : 'bg-indigo-600 text-white hover:bg-indigo-500'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
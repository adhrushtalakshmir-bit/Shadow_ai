import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Paperclip,
  Bell,
  Cpu,
  ChevronDown,
  Lock,
  AlertCircle,
} from 'lucide-react';

import { aiModels } from '../../data/dummyData';
import { chatWithLLM } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import UserMessage from './UserMessage';
import DetectionBox from './DetectionBox';
import AIMessage from './AIMessage';
import ScanningAnimation from './ScanningAnimation';

// Staggered animation variants for chat messages
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const ChatPanel = ({ onDetectionResult, onScanStateChange }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [selectedModel, setSelectedModel] = useState(aiModels[0]);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to the bottom whenever messages change or scanning starts
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isScanning]);

  // ── Send prompt to backend ──
  const handleSend = async () => {
    const prompt = inputValue.trim();
    if (!prompt || isScanning) return;

    setApiError(null);
    const timestamp = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    // 1. Add user message to chat
    const userMsg = {
      id: Date.now(),
      type: 'user',
      sender: 'You',
      time: timestamp,
      rawText: prompt,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');

    // 2. Show scanning animation
    setIsScanning(true);
    if (onScanStateChange) onScanStateChange(true);

    // 3. Call the backend chat API
    const result = await chatWithLLM(prompt, 'gemini');

    // 4. Remove scanning animation
    setIsScanning(false);
    if (onScanStateChange) onScanStateChange(false);

    if (result.success) {
      const data = result.data;
      const hasEntities = data.entities && data.entities.length > 0;

      // 5a. Add detection box if entities were found
      if (hasEntities) {
        const detectionMsg = {
          id: Date.now() + 1,
          type: 'detection',
          riskScore: data.risk_score,
          message: `We've detected and masked ${data.entities.length} sensitive item(s) in your prompt.`,
          detectedEntities: data.entities.map((e) => ({
            label: formatCategory(e.category),
            tagClass: `tag-${e.category.toLowerCase()}`,
          })),
          sanitizedPrompt: data.masked_text.split('\n'),
          modelName: selectedModel.name,
        };
        setMessages((prev) => [...prev, detectionMsg]);
      }

      // 5b. Add AI response message
      const aiMsg = {
        id: Date.now() + 2,
        type: 'ai',
        sender: selectedModel.name,
        time: timestamp,
        content: data.llm_response || "No response received from Gemini.",
      };
      setMessages((prev) => [...prev, aiMsg]);

      // 6. Notify parent (App.jsx) so the right panel updates
      if (onDetectionResult) {
        onDetectionResult({
          riskScore: data.risk_score,
          entities: data.entities || [],
          isSafe: data.risk_score === 0, // 0 means completely safe
          sanitizedPrompt: data.masked_text,
          originalPrompt: prompt,
          timestamp,
        });
      }
    } else {
      // Check if error is network/connection-related or LLM service failure
      const isNetwork = result.error && (
        result.error.toLowerCase().includes('network') ||
        result.error.toLowerCase().includes('unreachable') ||
        result.error.toLowerCase().includes('connect') ||
        result.error.toLowerCase().includes('timeout')
      );
      
      const displayError = isNetwork ? 'Backend connection lost' : 'AI service temporarily unavailable';
      setApiError(displayError);
      
      const errorMsg = {
        id: Date.now() + 1,
        type: 'ai',
        sender: 'System',
        time: timestamp,
        content: `⚠️ ${displayError}. (Details: ${result.error})`,
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  // Handle Enter key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950/30">
      {/* ───── Header ───── */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60 glass z-10 sticky top-0">
        <div>
          <h1 className="text-xl font-bold text-slate-100">
            Hello, {user?.full_name ? user.full_name.split(' ')[0] : 'User'}! 👋
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Protecting your data while you explore the power of AI.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button 
              onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
              className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-300 hover:border-blue-500/50 hover:shadow-card transition-all"
            >
              <Cpu className="w-4 h-4 text-blue-500" />
              <span className="font-medium">Model: {selectedModel.name}</span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isModelDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {isModelDropdownOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-lg z-50 overflow-hidden"
                >
                  {aiModels.map(model => (
                    <button 
                      key={model.id}
                      onClick={() => { setSelectedModel(model); setIsModelDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-3 text-sm hover:bg-slate-700 transition-colors ${selectedModel.id === model.id ? 'bg-blue-900/40 text-blue-400 font-medium' : 'text-slate-300'}`}
                    >
                      {model.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button className="relative p-2 rounded-xl hover:bg-slate-800 transition-colors">
            <Bell className="w-5 h-5 text-slate-400" />
            <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-slate-900">
              3
            </span>
          </button>

          <div className="flex items-center gap-3 pl-3 border-l border-slate-700">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-md uppercase">
              <span className="text-xs font-bold text-white">
                {user?.full_name ? user.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
              </span>
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-slate-100 leading-tight">
                {user?.full_name || 'User'}
              </p>
              <p className="text-[11px] text-slate-400">{user?.email || 'user@example.com'}</p>
            </div>
          </div>
        </div>
      </header>

      {/* ───── Chat Messages Area ───── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-6 space-y-6"
      >
        {/* Empty state */}
        {messages.length === 0 && !isScanning && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center"
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-900/50 to-purple-900/50 flex items-center justify-center mb-5 shadow-lg shadow-blue-500/10 border border-blue-500/20">
              <Lock className="w-9 h-9 text-blue-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-200 mb-2">
              Shadow AI Guard is Active
            </h2>
            <p className="text-sm text-slate-500 max-w-md leading-relaxed">
              Type a prompt below to get started. Any sensitive data like Aadhaar,
              PAN, phone numbers, or API keys will be automatically detected,
              masked, and sanitized before reaching the AI model.
            </p>
          </motion.div>
        )}

        {/* Messages */}
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -10 }}
            >
              {msg.type === 'user' && <UserMessage message={msg} />}
              {msg.type === 'detection' && <DetectionBox detection={msg} />}
              {msg.type === 'ai' && <AIMessage message={msg} />}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Scanning animation */}
        <AnimatePresence>
          {isScanning && <ScanningAnimation />}
        </AnimatePresence>
      </div>

      {/* ───── API Error Banner ───── */}
      <AnimatePresence>
        {apiError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mx-6 mb-2 flex items-center gap-2 px-4 py-2 bg-red-900/30 border border-red-500/30 rounded-xl text-sm text-red-400"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">{apiError}</span>
            <button
              onClick={() => setApiError(null)}
              className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ───── Chat Input ───── */}
      <div className="px-6 pb-4">
        <div className="flex items-center gap-3 glass border border-slate-700/50 rounded-2xl px-4 py-3 shadow-card-hover transition-all focus-within:border-blue-500/50 focus-within:ring-4 focus-within:ring-blue-500/10">
          <button className="p-2 rounded-xl hover:bg-slate-800 transition-colors text-slate-500 hover:text-slate-300">
            <Paperclip className="w-5 h-5" />
          </button>

          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your prompt here..."
            disabled={isScanning}
            className="flex-1 text-sm text-slate-200 placeholder:text-slate-500 outline-none bg-transparent disabled:opacity-50"
          />

          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isScanning}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium px-5 py-2 rounded-xl hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <Send className="w-4 h-4" />
            {isScanning ? 'Scanning...' : 'Send'}
          </button>
        </div>

        <div className="flex items-center justify-center gap-1.5 mt-3">
          <Lock className="w-3 h-3 text-slate-400" />
          <span className="text-[11px] text-slate-400">
            Shadow AI Guard is always protecting your data in real-time.
          </span>
        </div>
      </div>
    </div>
  );
};

// Helper: "AADHAAR" → "Aadhaar Number", "PAN" → "PAN Number", etc.
function formatCategory(cat) {
  const map = {
    AADHAAR: 'Aadhaar Number',
    PAN: 'PAN Number',
    UPI: 'UPI ID',
    EMAIL: 'Email Address',
    PHONE: 'Phone Number',
    API_KEY: 'API Key',
    BANK_ACCOUNT: 'Bank Account',
  };
  return map[cat] || cat;
}

export default ChatPanel;

import { motion } from 'framer-motion';
import { Copy, ThumbsUp, ThumbsDown, Sparkles } from 'lucide-react';

const AIMessage = ({ message }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex gap-3.5 items-start justify-start max-w-[85%]"
    >
      {/* AI avatar icon */}
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md">
        <Sparkles className="w-4.5 h-4.5 text-white" strokeWidth={1.8} />
      </div>

      {/* Message bubble */}
      <div className="flex-1 glass border border-slate-200/60 rounded-2xl rounded-tl-none p-5 shadow-glass-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
        {/* Header: sender + time */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
            {message.sender}
          </span>
          <span className="text-[10px] text-slate-400">{message.time}</span>
        </div>

        {/* Message content */}
        <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap font-normal">
          {message.content}
        </p>

        {/* Action buttons */}
        <div className="flex items-center gap-1 mt-4 pt-3 border-t border-slate-100">
          <button
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 hover:bg-slate-50 px-2.5 py-1.5 rounded-lg transition-all"
            title="Copy response"
            onClick={() => {
              navigator.clipboard.writeText(message.content);
            }}
          >
            <Copy className="w-3.5 h-3.5" />
            Copy
          </button>
          <button
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-600 hover:bg-slate-50 px-2.5 py-1.5 rounded-lg transition-all"
            title="Good response"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
          </button>
          <button
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-rose-500 hover:bg-slate-50 px-2.5 py-1.5 rounded-lg transition-all"
            title="Bad response"
          >
            <ThumbsDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default AIMessage;

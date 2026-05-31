import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

// Map each sensitive category to its highlight CSS class
const highlightMap = {
  aadhaar: 'highlight-danger',
  pan: 'highlight-danger',
  bank: 'highlight-info',
  upi: 'highlight-warning',
  email: 'highlight-info',
  phone: 'highlight-warning',
  api_key: 'highlight-danger',
  bank_account: 'highlight-info',
};

const UserMessage = ({ message }) => {
  // If the message has rawText (live mode), render it as plain text
  // If the message has content array (legacy demo mode), render with highlights
  const renderContent = () => {
    if (message.rawText) {
      return <span>{message.rawText}</span>;
    }
    if (message.content && Array.isArray(message.content)) {
      return message.content.map((item, index) =>
        item.type === 'sensitive' ? (
          <span
            key={index}
            className={`${highlightMap[item.category] || ''} inline-block`}
          >
            {item.text}
          </span>
        ) : (
          <span key={index}>{item.text}</span>
        )
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex gap-3.5 items-start justify-end"
    >
      {/* Message bubble */}
      <div className="max-w-[75%] bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white rounded-2xl rounded-tr-none px-5 py-3.5 shadow-premium hover:shadow-lg transition-shadow duration-300">
        {/* Header row: sender + time */}
        <div className="flex items-center justify-between gap-6 mb-1.5 text-blue-100 text-[10px] font-semibold uppercase tracking-wider">
          <span>{message.sender}</span>
          <span>{message.time}</span>
        </div>

        {/* Message content */}
        <p className="text-sm leading-relaxed whitespace-pre-wrap text-white font-normal">
          {renderContent()}
        </p>
      </div>

      {/* Elegant user initials avatar */}
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-50 border border-blue-200/60 flex items-center justify-center flex-shrink-0 shadow-sm">
        <span className="text-xs font-bold text-indigo-600">AV</span>
      </div>
    </motion.div>
  );
};

export default UserMessage;

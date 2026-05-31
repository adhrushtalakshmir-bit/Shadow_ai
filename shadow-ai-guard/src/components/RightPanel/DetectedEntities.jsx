import { motion } from 'framer-motion';
import { Eye, ShieldOff } from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0 },
};

const categoryStyle = {
  AADHAAR: { icon: '🪪', color: 'text-red-400', bg: 'bg-red-900/40' },
  PAN: { icon: '📄', color: 'text-orange-400', bg: 'bg-orange-900/40' },
  BANK_ACCOUNT: { icon: '🏦', color: 'text-blue-400', bg: 'bg-blue-900/40' },
  UPI: { icon: '📱', color: 'text-purple-400', bg: 'bg-purple-900/40' },
  PHONE: { icon: '📞', color: 'text-teal-400', bg: 'bg-teal-900/40' },
  EMAIL: { icon: '📧', color: 'text-indigo-400', bg: 'bg-indigo-900/40' },
  API_KEY: { icon: '🔑', color: 'text-red-400', bg: 'bg-red-900/40' },
  PER: { icon: '👤', color: 'text-pink-400', bg: 'bg-pink-900/40' },
  ORG: { icon: '🏢', color: 'text-cyan-400', bg: 'bg-cyan-900/40' },
  LOC: { icon: '📍', color: 'text-amber-400', bg: 'bg-amber-900/40' },
};

const defaultStyle = { icon: '🔍', color: 'text-slate-300', bg: 'bg-slate-800' };

const formatLabel = (cat) => {
  const map = {
    AADHAAR: 'Aadhaar Number',
    PAN: 'PAN Number',
    UPI: 'UPI ID',
    EMAIL: 'Email Address',
    PHONE: 'Phone Number',
    API_KEY: 'API Key',
    BANK_ACCOUNT: 'Bank Account',
    PER: 'Person Name',
    ORG: 'Organization',
    LOC: 'Location',
  };
  return map[cat] || cat;
};

const DetectedEntities = ({ entities }) => {
  const list = entities || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-slate-900/80 backdrop-blur-xl shadow-lg shadow-black/20 p-5 border border-slate-700/50"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
          Detected Entities ({list.length})
        </h3>
        {list.length > 0 && (
          <button className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition-colors">
            <Eye className="w-3 h-3" />
            View All
          </button>
        )}
      </div>

      {list.length === 0 ? (
        <div className="flex flex-col items-center py-4 text-center">
          <ShieldOff className="w-8 h-8 text-slate-600 mb-2" />
          <p className="text-xs text-slate-500">No entities detected yet.</p>
          <p className="text-[11px] text-slate-600 mt-1">Send a prompt to scan.</p>
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-2"
        >
          {list.map((entity, index) => {
            const style = categoryStyle[entity.category] || defaultStyle;
            return (
              <motion.div
                key={index}
                variants={item}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-800 transition-colors cursor-default group"
              >
                <span className="text-lg flex-shrink-0">{style.icon}</span>
                <span className="text-sm text-slate-200 font-medium flex-1 truncate">
                  {formatLabel(entity.category)}
                </span>
                <span
                  className={`text-[10px] font-mono font-semibold px-2 py-1 rounded-md ${style.bg} ${style.color} whitespace-nowrap`}
                >
                  {entity.mask_token}
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
};

export default DetectedEntities;

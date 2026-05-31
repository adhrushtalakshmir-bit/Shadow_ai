import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { supportedAgents } from '../../data/dummyData';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1 },
};

const SupportedAgents = () => {
  const isEmoji = (str) => /\p{Emoji}/u.test(str) && str.length <= 2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-slate-900/80 backdrop-blur-xl shadow-lg shadow-black/20 p-5 border border-slate-700/50"
    >
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
        Supported AI Agents
      </h3>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-2.5"
      >
        {supportedAgents.map((agent) => (
          <motion.div
            key={agent.name}
            variants={item}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 cursor-pointer transition-shadow hover:shadow-md hover:border-slate-600"
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm"
              style={{
                backgroundColor: isEmoji(agent.icon) ? '#1e293b' : agent.color,
              }}
            >
              {isEmoji(agent.icon) ? (
                <span className="text-xl leading-none">{agent.icon}</span>
              ) : (
                <span
                  className="text-lg font-bold leading-none"
                  style={{ color: isEmoji(agent.icon) ? agent.color : 'white' }}
                >
                  {agent.icon}
                </span>
              )}
            </div>

            <span className="text-xs font-semibold text-slate-300">
              {agent.name}
            </span>
          </motion.div>
        ))}
      </motion.div>

      <button className="mt-4 w-full text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center justify-center gap-1 transition-colors">
        Manage Agents
        <ArrowRight className="w-3 h-3" />
      </button>
    </motion.div>
  );
};

export default SupportedAgents;

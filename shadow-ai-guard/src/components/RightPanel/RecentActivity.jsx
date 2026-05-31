import { motion } from 'framer-motion';
import { Eye, Inbox } from 'lucide-react';

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

const RecentActivity = ({ activityLog }) => {
  const activities = activityLog || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-slate-900/80 backdrop-blur-xl shadow-lg shadow-black/20 p-5 border border-slate-700/50"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
          Recent Activity
        </h3>
        {activities.length > 0 && (
          <button className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition-colors">
            <Eye className="w-3 h-3" />
            View All
          </button>
        )}
      </div>

      {activities.length === 0 ? (
        <div className="flex flex-col items-center py-4 text-center">
          <Inbox className="w-8 h-8 text-slate-600 mb-2" />
          <p className="text-xs text-slate-500">No activity yet.</p>
          <p className="text-[11px] text-slate-600 mt-1">Scans will appear here in real-time.</p>
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-3"
        >
          {activities.slice(-8).reverse().map((activity, index) => (
            <motion.div
              key={index}
              variants={item}
              className="flex items-start gap-3 group"
            >
              <span
                className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${activity.color}`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-300 font-medium leading-snug">
                  {activity.label}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {activity.time}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default RecentActivity;

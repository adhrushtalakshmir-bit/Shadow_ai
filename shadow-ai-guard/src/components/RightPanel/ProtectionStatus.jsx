import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert } from 'lucide-react';

const ProtectionStatus = ({ latestResult }) => {
  // If a scan has been done and it was NOT safe, show alert state
  const isAlert = latestResult && !latestResult.isSafe;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-slate-900/80 backdrop-blur-xl shadow-lg shadow-black/20 p-5 border border-slate-700/50 relative overflow-hidden"
    >
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
        Protection Status
      </h3>

      <div className="flex flex-col items-center text-center">
        {/* Pulsing circle with shield icon */}
        <div className="relative mb-3">
          <motion.div
            className={`absolute inset-0 rounded-full ${isAlert ? 'bg-amber-400/20' : 'bg-green-400/20'}`}
            animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className={`relative w-16 h-16 rounded-full flex items-center justify-center shadow-lg ${
            isAlert
              ? 'bg-gradient-to-br from-amber-400 to-red-500 shadow-red-500/20'
              : 'bg-gradient-to-br from-green-400 to-green-600 shadow-green-500/20'
          }`}>
            {isAlert
              ? <ShieldAlert className="w-8 h-8 text-white" strokeWidth={2.2} />
              : <ShieldCheck className="w-8 h-8 text-white" strokeWidth={2.2} />}
          </div>
        </div>

        {isAlert ? (
          <>
            <p className="text-amber-400 font-bold text-base mt-1">
              Threat Detected!
            </p>
            <p className="text-slate-500 text-xs mt-1 leading-relaxed">
              Sensitive data was found and masked automatically.
            </p>
          </>
        ) : (
          <>
            <p className="text-green-400 font-bold text-base mt-1">
              You are Protected!
            </p>
            <p className="text-slate-500 text-xs mt-1 leading-relaxed">
              All sensitive data is being detected and masked.
            </p>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default ProtectionStatus;

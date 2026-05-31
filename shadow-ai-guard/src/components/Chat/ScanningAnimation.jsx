import { motion } from 'framer-motion';
import { ShieldCheck, Loader2 } from 'lucide-react';

const ScanningAnimation = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-4 p-5 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50"
    >
      {/* Pulsing shield */}
      <div className="relative flex-shrink-0">
        <motion.div
          className="absolute inset-0 rounded-full bg-blue-400/20"
          animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Text + spinner */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 className="w-4 h-4 text-blue-500" />
          </motion.div>
          <span className="text-sm font-semibold text-blue-700">
            Shadow AI Guard is scanning your prompt...
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Detecting sensitive information and calculating risk score.
        </p>

        {/* Animated progress bar */}
        <div className="mt-3 h-1.5 bg-blue-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 2, ease: 'easeInOut' }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default ScanningAnimation;

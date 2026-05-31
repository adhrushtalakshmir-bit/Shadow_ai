import { motion } from 'framer-motion';
import { AlertTriangle, ShieldCheck, CheckCircle } from 'lucide-react';

const DetectionBox = ({ detection }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-4 max-w-[85%] ml-12"
    >
      {/* ── Detection Alert Box ── */}
      <div className="glass bg-gradient-to-br from-amber-50/70 to-amber-100/30 border border-amber-200/60 rounded-2xl p-5 shadow-glass-sm relative overflow-hidden">
        {/* Header row */}
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8.5 h-8.5 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-200/50">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-sm font-bold text-amber-900 tracking-tight">
              Shadow AI Guard Detection
            </span>
          </div>
          <span className="text-xs font-bold text-rose-600 bg-rose-50/80 px-3 py-1 rounded-full border border-rose-200/60 shadow-sm flex items-center gap-1.5 flex-shrink-0">
            <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
            Risk Score: {detection.riskScore}/100
          </span>
        </div>

        {/* Detection message */}
        <p className="text-xs text-amber-800 leading-relaxed font-medium mb-4">{detection.message}</p>

        {/* Tag chips for detected entities */}
        <div className="flex flex-wrap gap-2">
          {detection.detectedEntities.map((entity, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index, duration: 0.25 }}
              className={`tag-chip shadow-sm cursor-default hover:scale-[1.02] ${entity.tagClass}`}
            >
              {entity.label}
            </motion.span>
          ))}
        </div>
      </div>

      {/* ── Sanitized Prompt Box ── */}
      <div className="glass bg-gradient-to-br from-emerald-50/70 to-emerald-100/30 border border-emerald-200/60 rounded-2xl p-5 shadow-glass-sm relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8.5 h-8.5 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-200/50">
            <ShieldCheck className="w-4 h-4 text-emerald-600" strokeWidth={2.2} />
          </div>
          <span className="text-sm font-bold text-emerald-950 tracking-tight">
            Sanitized Prompt{' '}
            <span className="font-normal text-xs text-emerald-600 ml-1">
              (Only this will be sent to the AI model)
            </span>
          </span>
        </div>

        {/* Code-like sanitized prompt display */}
        <div className="bg-white/90 border border-emerald-200/80 rounded-xl p-4 font-mono text-xs text-slate-700 space-y-1 shadow-inner leading-relaxed">
          {detection.sanitizedPrompt.map((line, index) => (
            <div key={index} className="flex gap-3">
              <span className="text-emerald-500/55 select-none text-[10px] leading-5 font-bold">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="leading-5 whitespace-pre-wrap">{line}</span>
            </div>
          ))}
        </div>

        {/* Success message */}
        <div className="flex items-center gap-2 mt-4">
          <CheckCircle className="w-4.5 h-4.5 text-emerald-500" strokeWidth={2.2} />
          <span className="text-xs text-emerald-800 font-semibold tracking-tight">
            Your data is protected. Sanitized prompt sent successfully to{' '}
            <span className="text-emerald-900 underline decoration-emerald-400 font-bold">
              {detection.modelName || 'the AI model'}
            </span>.
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default DetectionBox;

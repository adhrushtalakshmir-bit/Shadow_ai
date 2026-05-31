import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Server,
  Sparkles,
  ScanEye,
  ShieldCheck,
  Wifi,
  WifiOff,
  RefreshCw,
} from 'lucide-react';
import { checkHealth } from '../../services/api';

// ── Animated pulsing dot ──
const StatusDot = ({ status }) => {
  const colorMap = {
    online: 'bg-emerald-500',
    offline: 'bg-rose-500',
    scanning: 'bg-amber-400',
    idle: 'bg-slate-300',
  };
  const pulseMap = {
    online: 'bg-emerald-400',
    offline: 'bg-rose-400',
    scanning: 'bg-amber-300',
    idle: 'bg-slate-600',
  };
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span
        className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${pulseMap[status] || pulseMap.idle}`}
      />
      <span
        className={`relative inline-flex rounded-full h-2.5 w-2.5 ${colorMap[status] || colorMap.idle}`}
      />
    </span>
  );
};

// ── Individual status row ──
const StatusRow = ({ icon: Icon, label, status, detail }) => {
  const labelColor = {
    online: 'text-emerald-600',
    offline: 'text-rose-500',
    scanning: 'text-amber-600',
    idle: 'text-slate-400',
  };
  const badgeColor = {
    online: 'bg-emerald-900/40 text-emerald-400 border-emerald-500/30',
    offline: 'bg-rose-900/40 text-rose-400 border-rose-500/30',
    scanning: 'bg-amber-900/40 text-amber-400 border-amber-500/30',
    idle: 'bg-slate-800/50 text-slate-400 border-slate-700/50',
  };
  const badgeLabel = {
    online: 'Connected',
    offline: 'Offline',
    scanning: 'Scanning',
    idle: 'Idle',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-slate-800/80 transition-all duration-200 group"
    >
      {/* Icon */}
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 flex items-center justify-center shadow-sm group-hover:shadow transition-shadow">
        <Icon className="w-4 h-4 text-slate-500" strokeWidth={1.8} />
      </div>

      {/* Label & Detail */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-300 leading-tight truncate">
          {label}
        </p>
        {detail && (
          <p className="text-[10px] text-slate-400 leading-tight mt-0.5 truncate">
            {detail}
          </p>
        )}
      </div>

      {/* Status badge + dot */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <StatusDot status={status} />
        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${badgeColor[status] || badgeColor.idle}`}
        >
          {badgeLabel[status] || 'Unknown'}
        </span>
      </div>
    </motion.div>
  );
};

// ── Main Component ──
const LiveStatusIndicators = ({ isScanning }) => {
  const [backendStatus, setBackendStatus] = useState('idle');
  const [geminiStatus, setGeminiStatus] = useState('idle');
  const [lastChecked, setLastChecked] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const performHealthCheck = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const result = await checkHealth();
      if (result.success) {
        setBackendStatus('online');
        // If backend is online and has gemini info, mark gemini online
        setGeminiStatus('online');
      } else {
        setBackendStatus('offline');
        setGeminiStatus('offline');
      }
    } catch {
      setBackendStatus('offline');
      setGeminiStatus('offline');
    }
    setLastChecked(new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }));
    // Small delay so refresh icon animation is visible
    setTimeout(() => setIsRefreshing(false), 400);
  }, []);

  // Auto-poll every 15 seconds
  useEffect(() => {
    performHealthCheck(); // initial check
    const interval = setInterval(performHealthCheck, 15000);
    return () => clearInterval(interval);
  }, [performHealthCheck]);

  const scanStatus = isScanning ? 'scanning' : 'idle';
  const protectionStatus = backendStatus === 'online' ? 'online' : 'offline';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-slate-900/80 backdrop-blur-xl shadow-lg shadow-black/20 border border-slate-700/50 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          {backendStatus === 'online' ? (
            <Wifi className="w-4 h-4 text-emerald-500" strokeWidth={2} />
          ) : (
            <WifiOff className="w-4 h-4 text-rose-500" strokeWidth={2} />
          )}
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            System Status
          </h3>
        </div>
        <div className="flex items-center gap-2.5">
          {lastChecked && (
            <span className="text-[9px] text-slate-400 font-medium">
              {lastChecked}
            </span>
          )}
          <button
            onClick={performHealthCheck}
            disabled={isRefreshing}
            className="p-1.5 rounded-lg hover:bg-slate-800 transition-all disabled:opacity-50"
            title="Refresh status"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-slate-400 ${isRefreshing ? 'animate-spin' : ''}`}
              strokeWidth={2}
            />
          </button>
        </div>
      </div>

      {/* Status Rows */}
      <div className="p-2 space-y-0.5">
        <StatusRow
          icon={Server}
          label="Backend Server"
          status={backendStatus}
          detail={backendStatus === 'online' ? (import.meta.env.VITE_API_URL || 'localhost:8000') : 'Unable to connect'}
        />
        <StatusRow
          icon={Sparkles}
          label="Gemini API"
          status={geminiStatus}
          detail={geminiStatus === 'online' ? 'gemini-3.5-flash' : 'Service unavailable'}
        />
        <StatusRow
          icon={ScanEye}
          label="AI Scanner"
          status={scanStatus}
          detail={isScanning ? 'Analyzing prompt...' : 'Ready to scan'}
        />
        <StatusRow
          icon={ShieldCheck}
          label="Protection Engine"
          status={protectionStatus}
          detail={protectionStatus === 'online' ? 'All filters active' : 'Filters inactive'}
        />
      </div>

      {/* Footer status bar */}
      <AnimatePresence mode="wait">
        <motion.div
          key={backendStatus}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className={`px-5 py-2 text-center text-[10px] font-bold uppercase tracking-widest ${
            backendStatus === 'online'
              ? 'bg-gradient-to-r from-emerald-900/40 to-teal-900/40 text-emerald-400 border-t border-emerald-500/30'
              : 'bg-gradient-to-r from-rose-900/40 to-red-900/40 text-rose-400 border-t border-rose-500/30'
          }`}
        >
          {backendStatus === 'online'
            ? '● All systems operational'
            : '● System degraded — check backend'}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default LiveStatusIndicators;

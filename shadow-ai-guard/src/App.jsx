import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Sidebar from './components/Sidebar';
import ChatPanel from './components/Chat';
import ImageScanPanel from './components/ImageScan';
import RightPanel from './components/RightPanel';
import HistoryPanel from './components/History/HistoryPanel';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import { useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-950 text-slate-400">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

function Dashboard() {
  const { user } = useAuth();
  const [activeItem, setActiveItem] = useState('ai-chat');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Shared State for live detection results ──
  const [latestResult, setLatestResult] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [isScanning, setIsScanning] = useState(false);

  // Called by ChatPanel whenever a detection completes
  const handleDetectionResult = (result) => {
    // Update the latest result (for ProtectionStatus & DetectedEntities)
    setLatestResult(result);

    // Append to scan history (for RiskOverview chart)
    setScanHistory((prev) => [...prev, result]);

    // Build activity log entries
    const newActivities = [];
    if (result.entities && result.entities.length > 0) {
      newActivities.push({
        time: result.timestamp,
        label: `${result.isSafe ? 'Low' : 'High'} Risk Data Detected (Score: ${result.riskScore})`,
        color: result.riskScore >= 70 ? 'bg-red-500' : result.riskScore >= 40 ? 'bg-amber-500' : 'bg-green-500',
      });
      newActivities.push({
        time: result.timestamp,
        label: `${result.entities.length} entit${result.entities.length > 1 ? 'ies' : 'y'} masked successfully`,
        color: 'bg-green-500',
      });
    } else {
      newActivities.push({
        time: result.timestamp,
        label: 'Scanned — no sensitive data found',
        color: 'bg-blue-500',
      });
    }
    
    // Only log "sent to AI" if it was a chat prompt, not an image upload
    if (activeItem === 'ai-chat') {
      newActivities.push({
        time: result.timestamp,
        label: 'Sanitized prompt sent to AI model',
        color: 'bg-purple-500',
      });
    }

    setActivityLog((prev) => [...prev, ...newActivities]);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-blue-950/30">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Left Sidebar */}
      <div
        className={`
          fixed lg:relative z-50 h-full
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <Sidebar
          activeItem={activeItem}
          setActiveItem={setActiveItem}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />
      </div>

      {/* Center Panel */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/80 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
              aria-label="Open sidebar"
            >
              <Menu size={20} className="text-slate-400" />
            </button>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-200 text-sm">Shadow AI Guard</span>
            </div>
          </div>
          {/* Dynamic Mobile Profile */}
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg uppercase text-white font-bold text-xs">
               {user?.full_name ? user.full_name[0] : 'U'}
             </div>
          </div>
        </div>

        {/* Desktop Top Right Header (visible lg+) */}
        <div className="hidden lg:flex items-center justify-end px-6 py-4 bg-transparent absolute top-0 right-0 z-10 w-full pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-3 bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-full px-3 py-1.5 shadow-lg">
             <div className="text-right">
                <p className="text-xs font-bold text-slate-200 leading-tight">{user?.full_name || 'User'}</p>
                <p className="text-[10px] font-medium text-slate-400">{user?.email || 'user@example.com'}</p>
             </div>
             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center uppercase text-white font-bold text-xs shadow-inner">
               {user?.full_name ? user.full_name[0] : 'U'}
             </div>
          </div>
        </div>

        {activeItem === 'history' ? (
          <HistoryPanel />
        ) : activeItem === 'image-scan' ? (
          <ImageScanPanel onScanStateChange={setIsScanning} setLatestResult={handleDetectionResult} />
        ) : (
          <ChatPanel onDetectionResult={handleDetectionResult} onScanStateChange={setIsScanning} />
        )}
      </main>

      {/* Right Panel - Hidden on smaller screens */}
      <div className="hidden xl:block">
        <RightPanel
          latestResult={latestResult}
          scanHistory={scanHistory}
          activityLog={activityLog}
          isScanning={isScanning}
        />
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;

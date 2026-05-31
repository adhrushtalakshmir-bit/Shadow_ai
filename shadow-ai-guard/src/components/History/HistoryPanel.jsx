import { useState, useEffect } from 'react';
import { historyService } from '../../services/history';
import { Clock, Trash2, Search, Activity, ShieldAlert, CheckCircle, ShieldCheck, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const HistoryPanel = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await historyService.getHistory();
      setHistory(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this scan record?")) {
      try {
        await historyService.deleteHistory(id);
        setHistory(history.filter(h => h.id !== id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredHistory = history.filter(h => 
    (h.filename && h.filename.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (h.extracted_text && h.extracted_text.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex-1 flex flex-col bg-slate-950 overflow-y-auto">
      <div className="sticky top-0 z-10 glass border-b border-slate-700/50 px-6 py-4 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-100">Scan History Dashboard</h2>
          <p className="text-xs text-slate-400">Persistent audit log of all AI scans.</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search scans..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 border border-slate-700 rounded-lg text-sm w-64 bg-slate-800/50 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
      </div>

      <div className="p-6 max-w-6xl mx-auto w-full space-y-6">
        
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-blue-900/30 flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Total Scans</p>
              <h3 className="text-2xl font-bold text-slate-100">{history.length}</h3>
            </div>
          </div>
          
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-red-900/30 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">High Risk Detected</p>
              <h3 className="text-2xl font-bold text-slate-100">{history.filter(h => h.risk_score > 50).length}</h3>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-emerald-900/30 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Safe Scans</p>
              <h3 className="text-2xl font-bold text-slate-100">{history.filter(h => h.risk_score <= 50).length}</h3>
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/50">
            <h3 className="font-semibold text-slate-200 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Recent Activity
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950 text-slate-400 font-medium border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3">Timestamp</th>
                  <th className="px-6 py-3">File / Context</th>
                  <th className="px-6 py-3">Risk Level</th>
                  <th className="px-6 py-3">Score</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Loading history...
                    </td>
                  </tr>
                ) : filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                      No scan history found.
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((row) => (
                    <motion.tr 
                      key={row.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-slate-800/80 transition-colors group"
                    >
                      <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                        {new Date(row.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-100">{row.filename || "Direct Text Prompt"}</div>
                        <div className="text-xs text-slate-400 truncate max-w-[200px] mt-0.5">
                          {row.extracted_text}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
                          ${row.risk_score > 70 ? 'bg-red-900/40 text-red-400' : 
                            row.risk_score > 40 ? 'bg-amber-900/40 text-amber-400' : 
                            'bg-emerald-900/40 text-emerald-400'}`}>
                          {row.risk_score > 70 ? 'High' : row.risk_score > 40 ? 'Medium' : 'Low'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-300 font-medium">
                        {row.risk_score}/100
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDelete(row.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-900/30 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HistoryPanel;

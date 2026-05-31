import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const defaultData = [
  { name: 'No Scans', value: 100, color: '#334155' },
];

const RiskOverview = ({ scanHistory }) => {
  const hasData = scanHistory && scanHistory.length > 0;

  let chartData = defaultData;
  let averageRisk = 0;
  let riskLabel = 'No Data';
  let riskColor = 'text-slate-500';

  if (hasData) {
    const totalRisk = scanHistory.reduce((sum, s) => sum + s.riskScore, 0);
    averageRisk = Math.round(totalRisk / scanHistory.length);

    const high = scanHistory.filter((s) => s.riskScore >= 70).length;
    const medium = scanHistory.filter((s) => s.riskScore >= 40 && s.riskScore < 70).length;
    const low = scanHistory.filter((s) => s.riskScore < 40).length;

    chartData = [
      { name: 'High Risk', value: high || 0, color: '#ef4444' },
      { name: 'Medium Risk', value: medium || 0, color: '#f59e0b' },
      { name: 'Low Risk', value: low || 0, color: '#22c55e' },
    ].filter((d) => d.value > 0);

    if (chartData.length === 0) chartData = defaultData;

    if (averageRisk >= 70) {
      riskLabel = 'High Risk';
      riskColor = 'text-red-400';
    } else if (averageRisk >= 40) {
      riskLabel = 'Medium';
      riskColor = 'text-amber-400';
    } else {
      riskLabel = 'Low Risk';
      riskColor = 'text-green-400';
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-slate-900/80 backdrop-blur-xl shadow-lg shadow-black/20 p-5 border border-slate-700/50"
    >
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
        Risk Overview
      </h3>

      <div className="flex items-center gap-4">
        <div className="relative w-28 h-28 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={32}
                outerRadius={50}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-slate-100 leading-none">
              {hasData ? averageRisk : '—'}
            </span>
            <span className={`text-[10px] font-semibold mt-0.5 ${riskColor}`}>
              {riskLabel}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-slate-400 whitespace-nowrap">
                {item.name}
              </span>
              <span className="text-xs font-semibold text-slate-200 ml-auto">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default RiskOverview;

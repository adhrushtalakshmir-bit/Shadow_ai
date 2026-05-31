import { motion } from 'framer-motion';
import ProtectionStatus from './ProtectionStatus';
import RiskOverview from './RiskOverview';
import DetectedEntities from './DetectedEntities';
import LiveStatusIndicators from './LiveStatusIndicators';
import SupportedAgents from './SupportedAgents';
import RecentActivity from './RecentActivity';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const card = {
  hidden: { opacity: 0, x: 30 },
  show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 260, damping: 24 } },
};

const RightPanel = ({ latestResult, scanHistory, activityLog, isScanning }) => {
  return (
    <aside className="hidden xl:flex w-[320px] min-w-[320px] border-l border-slate-800/60 bg-slate-900/60 backdrop-blur-xl overflow-y-auto shadow-[-4px_0_24px_rgba(0,0,0,0.5)]">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-4 p-4 w-full"
      >
        <motion.div variants={card}>
          <ProtectionStatus latestResult={latestResult} />
        </motion.div>

        <motion.div variants={card}>
          <LiveStatusIndicators isScanning={isScanning} />
        </motion.div>

        <motion.div variants={card}>
          <RiskOverview scanHistory={scanHistory} />
        </motion.div>

        <motion.div variants={card}>
          <DetectedEntities entities={latestResult?.entities || latestResult?.detected_entities} />
        </motion.div>

        <motion.div variants={card}>
          <SupportedAgents />
        </motion.div>

        <motion.div variants={card}>
          <RecentActivity activityLog={activityLog} />
        </motion.div>
      </motion.div>
    </aside>
  );
};

export default RightPanel;

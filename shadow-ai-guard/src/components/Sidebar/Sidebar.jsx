import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Plus,
  LayoutDashboard,
  MessageSquare,
  Clock,
  AlertTriangle,
  ShieldAlert,
  BarChart3,
  FileText,
  FileBarChart,
  Users,
  Building2,
  Settings,
  ChevronDown,
  X,
  Image,
  LogOut,
} from 'lucide-react';
import { navItems, adminNavItems } from '../../data/dummyData';
import { useAuth } from '../../context/AuthContext';

// Map icon name strings from dummyData to actual Lucide components
const iconMap = {
  LayoutDashboard,
  MessageSquare,
  Image,
  Clock,
  AlertTriangle,
  ShieldAlert,
  BarChart3,
  FileText,
  FileBarChart,
  Users,
  Building2,
  Settings,
};

const sidebarVariants = {
  hidden: { x: -280, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
  exit: {
    x: -280,
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};

const navItemVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: (i) => ({
    x: 0,
    opacity: 1,
    transition: { delay: 0.05 * i, duration: 0.3, ease: 'easeOut' },
  }),
};

function NavItem({ item, index, isActive, onClick }) {
  const IconComponent = iconMap[item.icon];

  return (
    <motion.button
      custom={index}
      variants={navItemVariants}
      initial="hidden"
      animate="visible"
      onClick={() => onClick(item.id)}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      className={`
        group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5
        text-sm font-medium transition-colors duration-200 cursor-pointer
        ${
          isActive
            ? 'bg-blue-950/60 text-blue-300 border border-blue-800/40 shadow-sm shadow-blue-500/5'
            : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
        }
      `}
    >
      {/* Active indicator – left border */}
      {isActive && (
        <motion.div
          layoutId="activeNavIndicator"
          className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full bg-blue-600"
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        />
      )}

      {/* Icon */}
      {IconComponent && (
        <IconComponent
          size={18}
          className={`flex-shrink-0 ${
            isActive
              ? 'text-blue-400'
              : 'text-slate-500 group-hover:text-slate-300'
          }`}
        />
      )}

      {/* Label */}
      <span className="flex-1 text-left">{item.label}</span>

      {/* Badge */}
      {item.badge && (
        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
          {item.badge}
        </span>
      )}
    </motion.button>
  );
}

function Sidebar({ activeItem, setActiveItem, isOpen, setIsOpen }) {
  const { user, logout } = useAuth();

  const handleNavClick = (id) => {
    setActiveItem(id);
    // Auto-close on mobile after selection
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  /* ───── Sidebar content (shared between desktop & mobile) ───── */
  const sidebarContent = (
    <div className="flex h-full flex-col bg-slate-900">
      {/* ── Logo Area ── */}
      <div className="flex items-center gap-3 px-5 pt-6 pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg shadow-blue-500/25">
          <Shield size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-sm font-extrabold tracking-wide text-slate-100">
            SHADOW AI GUARD
          </h1>
          <p className="text-[10px] font-semibold tracking-wide text-slate-300">
            AI Security. Data Privacy. You First.
          </p>
        </div>
        {/* Close button – mobile only */}
        <button
          onClick={() => setIsOpen(false)}
          className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 lg:hidden"
        >
          <X size={16} />
        </button>
      </div>

      {/* ── New Chat Button ── */}
      <div className="px-4 pb-4 pt-1">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-premium transition-all hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5"
        >
          <Plus size={18} strokeWidth={2.5} />
          New Chat
        </motion.button>
      </div>

      {/* ── Scrollable Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-3 pb-2">
        {/* Main nav */}
        <div className="mb-1">
          <p className="mb-2 px-3 text-[10.5px] font-bold uppercase tracking-widest text-slate-200">
            Main Menu
          </p>
          <div className="space-y-0.5">
            {navItems.map((item, i) => (
              <NavItem
                key={item.id}
                item={item}
                index={i}
                isActive={activeItem === item.id}
                onClick={handleNavClick}
              />
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="my-3 border-t border-slate-800" />

        {/* Admin section */}
        <div>
          <p className="mb-2 px-3 text-[10.5px] font-bold uppercase tracking-widest text-slate-200">
            Admin
          </p>
          <div className="space-y-0.5">
            {adminNavItems.map((item, i) => (
              <NavItem
                key={item.id}
                item={item}
                index={navItems.length + i}
                isActive={activeItem === item.id}
                onClick={handleNavClick}
              />
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="my-3 border-t border-slate-800" />

        {/* ── Branded Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="mx-1 rounded-2xl bg-gradient-to-br from-slate-900 via-blue-900/30 to-indigo-900/20 p-4 border border-slate-700/50 shadow-glass-sm relative overflow-hidden"
        >
          {/* Shield illustration */}
          <div className="mb-3 flex justify-center">
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg shadow-blue-400/30">
                <Shield size={22} className="text-white" />
              </div>
              {/* Decorative ring */}
              <div className="absolute inset-0 rounded-full border-2 border-blue-300/40 animate-ping" style={{ animationDuration: '3s' }} />
            </div>
          </div>
          <p className="text-center text-xs font-semibold leading-relaxed text-slate-300">
            Your Data is Safe with
          </p>
          <p className="text-center text-xs font-bold leading-relaxed gradient-text">
            Shadow AI Guard
          </p>
        </motion.div>
      </nav>

      {/* ── User Profile ── */}
      <div className="border-t border-slate-800 p-4">
        <motion.button
          onClick={logout}
          whileHover={{ backgroundColor: 'rgba(30, 41, 59, 1)' }}
          className="flex w-full items-center gap-3 rounded-xl p-2 transition-colors"
          title="Log out"
        >
          {/* Avatar */}
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-xs font-bold text-white shadow-md uppercase">
            {user?.full_name ? user.full_name[0] : 'U'}
          </div>
          {/* Info */}
          <div className="flex-1 text-left">
            <p className="text-sm font-bold text-slate-100 leading-tight">
              {user?.full_name || 'User'}
            </p>
            <p className="text-[11.5px] font-medium text-slate-300">{user?.email || 'user@example.com'}</p>
          </div>
          <LogOut size={16} className="text-slate-400 hover:text-red-500 transition-colors" />
        </motion.button>
      </div>
    </div>
  );

  return (
    <>
      {/* ════════ Desktop Sidebar ════════ */}
      <motion.aside
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        className="hidden lg:flex h-screen w-[260px] min-w-[260px] flex-col border-r border-slate-800/80 bg-slate-900/80 backdrop-blur-xl sticky top-0 shadow-[4px_0_24px_rgba(0,0,0,0.5)]"
      >
        {sidebarContent}
      </motion.aside>

      {/* ════════ Mobile Sidebar (overlay) ════════ */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            />
            {/* Drawer */}
            <motion.aside
              variants={sidebarVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed left-0 top-0 z-50 flex h-screen w-[280px] flex-col border-r border-slate-800 bg-slate-900 shadow-2xl lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default Sidebar;

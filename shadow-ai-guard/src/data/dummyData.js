// ===== DUMMY DATA FOR SHADOW AI GUARD DASHBOARD =====

// Chat messages for the AI Chat panel
export const chatMessages = [
  {
    id: 1,
    type: 'user',
    sender: 'You',
    time: '10:24 AM',
    content: [
      { text: 'My Aadhaar number is ', type: 'normal' },
      { text: '4567 8899 1234', type: 'sensitive', category: 'aadhaar' },
      { text: '\nand my PAN is ', type: 'normal' },
      { text: 'ABCPT1234D', type: 'sensitive', category: 'pan' },
      { text: '.\nPlease check my bank account ', type: 'normal' },
      { text: '50100288099877', type: 'sensitive', category: 'bank' },
      { text: '\nand UPI id is ', type: 'normal' },
      { text: 'ramesh@ybl', type: 'sensitive', category: 'upi' },
    ],
  },
  {
    id: 2,
    type: 'detection',
    riskScore: 92,
    message: "We've detected and masked sensitive information in your prompt.",
    detectedEntities: [
      { label: 'Aadhaar Number', tagClass: 'tag-aadhaar' },
      { label: 'PAN Number', tagClass: 'tag-pan' },
      { label: 'Bank Account', tagClass: 'tag-bank' },
      { label: 'UPI ID', tagClass: 'tag-upi' },
    ],
    sanitizedPrompt: [
      'My Aadhaar number is [AADHAAR_ID_1]',
      'and my PAN is [PAN_ID_1].',
      'Please check my bank account [ACCOUNT_ID_1]',
      'and UPI id is [UPI_ID_1]',
    ],
  },
  {
    id: 3,
    type: 'ai',
    sender: 'Gemini 1.5 Pro',
    time: '10:25 AM',
    content:
      'I understand you want me to check the details. However, since this is a demonstration, I cannot access personal or banking information. Is there something else I can help you with?',
  },
];

// Detected entities for the right sidebar
export const detectedEntities = [
  { icon: '🪪', label: 'Aadhaar Number', value: '[AADHAAR_ID_1]', color: 'text-red-500', bg: 'bg-red-50' },
  { icon: '📄', label: 'PAN Number', value: '[PAN_ID_1]', color: 'text-orange-500', bg: 'bg-orange-50' },
  { icon: '🏦', label: 'Bank Account Number', value: '[ACCOUNT_ID_1]', color: 'text-blue-500', bg: 'bg-blue-50' },
  { icon: '📱', label: 'UPI ID', value: '[UPI_ID_1]', color: 'text-purple-500', bg: 'bg-purple-50' },
];

// Supported AI Agents
export const supportedAgents = [
  {
    name: 'Google',
    color: '#4285F4',
    icon: 'G',
    bgGradient: 'from-blue-50 to-blue-100',
    borderColor: 'border-blue-200',
  },
  {
    name: 'Gemini',
    color: '#8B5CF6',
    icon: '✦',
    bgGradient: 'from-purple-50 to-indigo-100',
    borderColor: 'border-purple-200',
  },
  {
    name: 'OpenAI',
    color: '#10a37f',
    icon: 'O',
    bgGradient: 'from-emerald-50 to-emerald-100',
    borderColor: 'border-emerald-200',
  },
  {
    name: 'Claude',
    color: '#d97757',
    icon: 'C',
    bgGradient: 'from-orange-50 to-orange-100',
    borderColor: 'border-orange-200',
  },
  {
    name: 'DeepSeek',
    color: '#0ea5e9',
    icon: '🔍',
    bgGradient: 'from-cyan-50 to-sky-100',
    borderColor: 'border-cyan-200',
  },
];

// Recent activity
export const recentActivity = [
  { time: '10:24 AM', label: 'High Risk Prompt Detected', color: 'bg-red-500' },
  { time: '10:24 AM', label: 'Data Masked Successfully', color: 'bg-green-500' },
  { time: '10:24 AM', label: 'Sent to Gemini 1.5 Pro', color: 'bg-blue-500' },
  { time: '10:25 AM', label: 'Response Received', color: 'bg-purple-500' },
];

// Risk overview data for the donut chart
export const riskOverviewData = [
  { name: 'High Risk', value: 70, color: '#ef4444' },
  { name: 'Medium Risk', value: 20, color: '#f59e0b' },
  { name: 'Low Risk', value: 10, color: '#22c55e' },
];

// Navigation items for the sidebar
export const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', active: true },
  { id: 'ai-chat', label: 'AI Chat', icon: 'MessageSquare' },
  { id: 'image-scan', label: 'Image OCR Scan', icon: 'Image' },
  { id: 'history', label: 'History', icon: 'Clock' },
  { id: 'risk-alerts', label: 'Risk Alerts', icon: 'AlertTriangle', badge: 5 },
  { id: 'leakage', label: 'Leakage Attempts', icon: 'ShieldAlert' },
  { id: 'analytics', label: 'Analytics', icon: 'BarChart3' },
  { id: 'policies', label: 'Policies', icon: 'FileText' },
  { id: 'reports', label: 'Reports', icon: 'FileBarChart' },
];

// Admin nav items
export const adminNavItems = [
  { id: 'users', label: 'Users', icon: 'Users' },
  { id: 'departments', label: 'Departments', icon: 'Building2' },
  { id: 'settings', label: 'Settings', icon: 'Settings' },
];

// AI Models for dropdown
export const aiModels = [
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'Google' },
  { id: 'deepseek-v3', name: 'DeepSeek V3', provider: 'DeepSeek' },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
  { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'Claude' },
];

// Analytics stats
export const analyticsStats = [
  { label: 'Prompts Scanned', value: '2,847', change: '+12%', trend: 'up' },
  { label: 'Threats Blocked', value: '342', change: '+8%', trend: 'up' },
  { label: 'Data Masked', value: '1,205', change: '+23%', trend: 'up' },
  { label: 'Risk Score', value: '92/100', change: '-3%', trend: 'down' },
];

// User profile
export const userProfile = {
  name: 'Ananya Verma',
  role: 'Product Team',
  avatar: null,
  initials: 'AV',
};

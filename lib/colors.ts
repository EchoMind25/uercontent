/**
 * Color Palette Configuration
 *
 * Customize these colors to match your brand.
 * The default palette is inspired by Echo Mind's clean, blue-focused design.
 */

export const colorPalette = {
  // Primary brand colors (blues)
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',  // Main brand color
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },

  // Secondary accent (slate/neutral)
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },

  // Status colors
  success: {
    light: '#dcfce7',
    DEFAULT: '#22c55e',
    dark: '#15803d',
  },
  warning: {
    light: '#fef3c7',
    DEFAULT: '#f59e0b',
    dark: '#b45309',
  },
  error: {
    light: '#fee2e2',
    DEFAULT: '#ef4444',
    dark: '#b91c1c',
  },
  info: {
    light: '#dbeafe',
    DEFAULT: '#3b82f6',
    dark: '#1d4ed8',
  },
};

/**
 * Platform colors - using blue shades for cohesive design
 * Each platform has a distinct shade while staying within the blue family
 */
export const platformColors: Record<string, { bg: string; text: string; border: string; accent: string }> = {
  IGFB: {
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-200',
    accent: '#0ea5e9'  // Sky blue
  },
  LinkedIn: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    accent: '#2563eb'  // Royal blue
  },
  Blog: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    accent: '#4f46e5'  // Indigo
  },
  YouTube: {
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    border: 'border-violet-200',
    accent: '#7c3aed'  // Violet
  },
};

/**
 * Platform icons/emojis
 * Can be customized or replaced with actual icons
 */
export const platformEmojis: Record<string, string> = {
  IGFB: '📱',
  LinkedIn: '💼',
  Blog: '📝',
  YouTube: '🎬',
};

/**
 * Content status colors - semantic coloring
 */
export const statusColors: Record<string, { bg: string; text: string }> = {
  draft: {
    bg: 'bg-slate-100',
    text: 'text-slate-600'
  },
  approved: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700'
  },
  published: {
    bg: 'bg-blue-50',
    text: 'text-blue-700'
  },
  scheduled: {
    bg: 'bg-amber-50',
    text: 'text-amber-700'
  },
};

/**
 * Category badge colors for research URLs
 */
export const categoryColors: Record<string, string> = {
  'Market Research': 'bg-blue-50 text-blue-700 border-blue-200',
  'Local News': 'bg-sky-50 text-sky-700 border-sky-200',
  'Industry Trends': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Competitor Analysis': 'bg-violet-50 text-violet-700 border-violet-200',
  'General': 'bg-slate-50 text-slate-700 border-slate-200',
};

/**
 * Scrape frequency badge colors
 */
export const frequencyColors: Record<string, string> = {
  daily: 'bg-blue-100 text-blue-700',
  weekly: 'bg-indigo-100 text-indigo-700',
  monthly: 'bg-slate-100 text-slate-600',
};

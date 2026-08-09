// frontend/components/ui/ThemeProvider.ts
export const commodityThemes = {
  Mango: {
    primary: '#F59E0B',
    primaryLight: '#FCD34D',
    primaryDark: '#B45309',
    bgGradient: 'from-amber-50 to-yellow-50',
    badgeColor: 'bg-amber-100 text-amber-800',
    buttonColor: 'bg-amber-600 hover:bg-amber-700',
    icon: '🥭',
  },
  Avocado: {
    primary: '#10B981',
    primaryLight: '#6EE7B7',
    primaryDark: '#065F46',
    bgGradient: 'from-emerald-50 to-green-50',
    badgeColor: 'bg-emerald-100 text-emerald-800',
    buttonColor: 'bg-emerald-600 hover:bg-emerald-700',
    icon: '🥑',
  },
  Tomato: {
    primary: '#EF4444',
    primaryLight: '#FCA5A5',
    primaryDark: '#991B1B',
    bgGradient: 'from-red-50 to-rose-50',
    badgeColor: 'bg-red-100 text-red-800',
    buttonColor: 'bg-red-600 hover:bg-red-700',
    icon: '🍅',
  },
  Orange: {
    primary: '#F97316',
    primaryLight: '#FDBA74',
    primaryDark: '#9A3412',
    bgGradient: 'from-orange-50 to-amber-50',
    badgeColor: 'bg-orange-100 text-orange-800',
    buttonColor: 'bg-orange-600 hover:bg-orange-700',
    icon: '🍊',
  },
  Apple: {
    primary: '#DC2626',
    primaryLight: '#FCA5A5',
    primaryDark: '#991B1B',
    bgGradient: 'from-red-50 to-rose-50',
    badgeColor: 'bg-red-100 text-red-800',
    buttonColor: 'bg-red-600 hover:bg-red-700',
    icon: '🍎',
  },
  Banana: {
    primary: '#EAB308',
    primaryLight: '#FDE68A',
    primaryDark: '#854D0E',
    bgGradient: 'from-yellow-50 to-amber-50',
    badgeColor: 'bg-yellow-100 text-yellow-800',
    buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
    icon: '🍌',
  },
  Guava: {
    primary: '#84CC16',
    primaryLight: '#BEF264',
    primaryDark: '#3F6212',
    bgGradient: 'from-lime-50 to-green-50',
    badgeColor: 'bg-lime-100 text-lime-800',
    buttonColor: 'bg-lime-600 hover:bg-lime-700',
    icon: '🫒',
  },
  Default: {
    primary: '#6B7280',
    primaryLight: '#D1D5DB',
    primaryDark: '#374151',
    bgGradient: 'from-gray-50 to-slate-50',
    badgeColor: 'bg-gray-100 text-gray-800',
    buttonColor: 'bg-gray-600 hover:bg-gray-700',
    icon: '🍉',
  },
};

export function getCommodityTheme(commodity: string) {
  return commodityThemes[commodity as keyof typeof commodityThemes] || commodityThemes.Default;
}
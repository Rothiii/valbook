import type { WorkspaceTemplate } from './types';

export const BUILTIN_TEMPLATES: WorkspaceTemplate[] = [
  {
    id: 'blank',
    name: 'Blank',
    description: 'Start from scratch. No pre-defined categories.',
    icon: '◯',
    isBuiltin: true,
    definition: { categories: [] },
  },
  {
    id: 'personal-wealth',
    name: 'Personal Wealth',
    description: 'Tabungan, Saham, Crypto, Emas, Property.',
    icon: '💰',
    isBuiltin: true,
    definition: {
      categories: [
        { name: 'Tabungan', icon: '🏦', color: '#737373', fields: [] },
        { name: 'Saham', icon: '📈', color: '#737373', fields: [] },
        { name: 'Crypto', icon: '₿', color: '#737373', fields: [] },
        { name: 'Emas', icon: '🪙', color: '#737373', fields: [] },
        { name: 'Property', icon: '🏠', color: '#737373', fields: [] },
      ],
    },
  },
  {
    id: 'family-asset',
    name: 'Family Asset',
    description: 'Rumah, Kendaraan, Elektronik, Furniture, Koleksi.',
    icon: '🏡',
    isBuiltin: true,
    definition: {
      categories: [
        { name: 'Rumah', icon: '🏠', color: '#737373', fields: [] },
        { name: 'Kendaraan', icon: '🚗', color: '#737373', fields: [] },
        { name: 'Elektronik', icon: '💻', color: '#737373', fields: [] },
        { name: 'Furniture', icon: '🛋️', color: '#737373', fields: [] },
        { name: 'Koleksi', icon: '📦', color: '#737373', fields: [] },
      ],
    },
  },
  {
    id: 'office-equipment',
    name: 'Office Equipment',
    description: 'Laptop, Monitor, Peripheral, Furniture, Lisensi Software.',
    icon: '🖥️',
    isBuiltin: true,
    definition: {
      categories: [
        { name: 'Laptop', icon: '💻', color: '#737373', fields: [] },
        { name: 'Monitor', icon: '🖥️', color: '#737373', fields: [] },
        { name: 'Peripheral', icon: '⌨️', color: '#737373', fields: [] },
        { name: 'Furniture', icon: '🪑', color: '#737373', fields: [] },
        { name: 'Lisensi Software', icon: '🔑', color: '#737373', fields: [] },
      ],
    },
  },
  {
    id: 'real-estate',
    name: 'Real Estate',
    description: 'Tanah, Rumah, Apartemen, Ruko.',
    icon: '🏢',
    isBuiltin: true,
    definition: {
      categories: [
        { name: 'Tanah', icon: '🟫', color: '#737373', fields: [] },
        { name: 'Rumah', icon: '🏠', color: '#737373', fields: [] },
        { name: 'Apartemen', icon: '🏢', color: '#737373', fields: [] },
        { name: 'Ruko', icon: '🏪', color: '#737373', fields: [] },
      ],
    },
  },
  {
    id: 'crypto-portfolio',
    name: 'Crypto Portfolio',
    description: 'Bitcoin, Ethereum, Altcoin, Stablecoin.',
    icon: '₿',
    isBuiltin: true,
    definition: {
      categories: [
        { name: 'Bitcoin', icon: '₿', color: '#737373', fields: [] },
        { name: 'Ethereum', icon: 'Ξ', color: '#737373', fields: [] },
        { name: 'Altcoin', icon: '🪙', color: '#737373', fields: [] },
        { name: 'Stablecoin', icon: '💵', color: '#737373', fields: [] },
      ],
    },
  },
];

export function getTemplate(id: string): WorkspaceTemplate | undefined {
  return BUILTIN_TEMPLATES.find((t) => t.id === id);
}

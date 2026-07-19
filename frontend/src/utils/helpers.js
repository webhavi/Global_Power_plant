export const formatNumber = (num) => {
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num?.toFixed(1) || '0';
};

export const formatCapacity = (mw) => {
  if (mw >= 1000) return (mw / 1000).toFixed(1) + ' GW';
  return mw?.toFixed(1) + ' MW';
};

export const FUEL_COLORS = {
  Biomass: '#22c55e',
  Coal: '#6b7280',
  Gas: '#f59e0b',
  Geothermal: '#ef4444',
  Hydro: '#3b82f6',
  Nuclear: '#a855f7',
  Oil: '#78716c',
  Petcoke: '#92400e',
  Solar: '#eab308',
  Storage: '#06b6d4',
  Waste: '#84cc16',
  'Wave and Tidal': '#0ea5e9',
  Wind: '#10b981',
};

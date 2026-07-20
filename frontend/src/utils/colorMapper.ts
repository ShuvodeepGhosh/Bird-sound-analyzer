// A curated set of modern, vibrant colors for bird species
const COLORS = [
  '#4ade80', // Green
  '#60a5fa', // Blue
  '#fb923c', // Orange
  '#c084fc', // Purple
  '#f472b6', // Pink
  '#facc15', // Yellow
  '#2dd4bf', // Teal
  '#f87171', // Red
  '#818cf8', // Indigo
  '#34d399', // Emerald
  '#a78bfa', // Violet
  '#fbbf24', // Amber
];

const colorMap = new Map<string, string>();

/**
 * Deterministically assigns a color to a species name.
 * If the species already has a color, it returns the same one.
 * Otherwise, it assigns the next available color from the palette,
 * cycling back if it runs out of colors.
 */
export const getSpeciesColor = (speciesName: string): string => {
  if (colorMap.has(speciesName)) {
    return colorMap.get(speciesName)!;
  }

  let hash = 0;
  for (let i = 0; i < speciesName.length; i++) {
    hash = speciesName.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Math.abs to handle negative hashes from bitwise operations
  const nextColorIndex = Math.abs(hash) % COLORS.length;
  const nextColor = COLORS[nextColorIndex];
  
  colorMap.set(speciesName, nextColor);
  return nextColor;
};

export const resetColorMap = () => {
  colorMap.clear();
};

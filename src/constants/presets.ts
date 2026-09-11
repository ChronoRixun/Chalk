import type { ScoringDirection } from '@/types';

export interface Preset {
  id: string;
  name: string;
  description: string;
  direction: ScoringDirection;
  target: number | null;
  quickAdds: number[];
}

export const PRESETS: Preset[] = [
  { id: 'generic', name: 'Any game', description: 'Free tally. Highest score wins.', direction: 'high', target: null, quickAdds: [1, 5, 10] },
  { id: 'hearts', name: 'Hearts', description: 'Low wins. Ends when someone reaches 100.', direction: 'low', target: 100, quickAdds: [1, 5, 13, 26] },
  { id: 'spades', name: 'Spades', description: 'First to 500.', direction: 'high', target: 500, quickAdds: [10, 30, 50, 100] },
  { id: 'cribbage', name: 'Cribbage', description: 'First to 121.', direction: 'high', target: 121, quickAdds: [1, 2, 3, 6, 12] },
  { id: 'rummy', name: 'Rummy', description: 'First to 500.', direction: 'high', target: 500, quickAdds: [5, 10, 25, 50] },
  { id: 'gin', name: 'Gin Rummy', description: 'First to 100.', direction: 'high', target: 100, quickAdds: [1, 5, 10, 25] },
  { id: 'farkle', name: 'Farkle', description: 'First to 10,000.', direction: 'high', target: 10000, quickAdds: [50, 100, 500, 1000] },
  { id: 'uno', name: 'Uno', description: 'First to 500.', direction: 'high', target: 500, quickAdds: [2, 5, 10, 20, 50] },
  { id: 'phase10', name: 'Phase 10', description: 'Low wins. Penalty points per round.', direction: 'low', target: null, quickAdds: [5, 10, 15, 25] },
  { id: 'golf', name: 'Golf', description: 'Low wins after nine holes.', direction: 'low', target: null, quickAdds: [1, 2, 5, 10] },
  { id: 'skullking', name: 'Skull King', description: 'Highest after ten rounds.', direction: 'high', target: null, quickAdds: [10, 20, 30, 50] },
  { id: 'catan', name: 'Catan', description: 'First to 10 victory points.', direction: 'high', target: 10, quickAdds: [1, 2] },
  { id: 'yahtzee', name: 'Yahtzee', description: 'Highest total wins.', direction: 'high', target: null, quickAdds: [5, 10, 25, 50] },
  { id: 'scrabble', name: 'Scrabble', description: 'Highest total wins.', direction: 'high', target: null, quickAdds: [5, 10, 20, 50] },
];

export function getPreset(id: string): Preset {
  return PRESETS.find((p) => p.id === id) ?? PRESETS[0];
}

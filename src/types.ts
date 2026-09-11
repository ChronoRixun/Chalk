export type ScoringDirection = 'high' | 'low';

export interface Player {
  id: string;
  name: string;
  color: string;
}

export interface ScoreEntry {
  id: string;
  playerId: string;
  delta: number;
  /** Round the entry was recorded in (1-based). */
  round: number;
  /** Epoch milliseconds. */
  at: number;
}

export interface Game {
  id: string;
  name: string;
  presetId: string;
  direction: ScoringDirection;
  /** Game ends when any player reaches this score. null = play until someone taps Finish. */
  target: number | null;
  quickAdds: number[];
  players: Player[];
  entries: ScoreEntry[];
  round: number;
  dealerIndex: number;
  createdAt: number;
  updatedAt: number;
  finishedAt: number | null;
}

export interface NewGameInput {
  name: string;
  presetId: string;
  direction: ScoringDirection;
  target: number | null;
  quickAdds: number[];
  playerNames: string[];
}

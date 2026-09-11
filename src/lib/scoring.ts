import type { Game, Player } from '@/types';

export function totalsOf(game: Game): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const p of game.players) totals[p.id] = 0;
  for (const e of game.entries) totals[e.playerId] = (totals[e.playerId] ?? 0) + e.delta;
  return totals;
}

export interface Standing {
  player: Player;
  total: number;
  rank: number;
  tied: boolean;
}

/** Players ordered best-first for the game's direction. Equal totals share a rank. */
export function standingsOf(game: Game): Standing[] {
  const totals = totalsOf(game);
  const sorted = [...game.players].sort((a, b) =>
    game.direction === 'high' ? totals[b.id] - totals[a.id] : totals[a.id] - totals[b.id],
  );
  const ranked: Standing[] = [];
  sorted.forEach((player, i) => {
    const total = totals[player.id];
    const prev = ranked[i - 1];
    const rank = prev && prev.total === total ? prev.rank : i + 1;
    ranked.push({ player, total, rank, tied: false });
  });
  const countByRank: Record<number, number> = {};
  for (const s of ranked) countByRank[s.rank] = (countByRank[s.rank] ?? 0) + 1;
  return ranked.map((s) => ({ ...s, tied: countByRank[s.rank] > 1 }));
}

export interface Outcome {
  over: boolean;
  /** null when the game is over but the top spot is shared. */
  winner: Player | null;
}

export function outcomeOf(game: Game): Outcome {
  const standings = standingsOf(game);
  if (standings.length === 0) return { over: false, winner: null };
  let over = game.finishedAt !== null;
  if (!over && game.target !== null) {
    const target = game.target;
    over = Object.values(totalsOf(game)).some((v) => v >= target);
  }
  if (!over) return { over: false, winner: null };
  const top = standings[0];
  return { over: true, winner: top.tied ? null : top.player };
}

export function rankLabel(rank: number): string {
  const mod100 = rank % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${rank}th`;
  switch (rank % 10) {
    case 1:
      return `${rank}st`;
    case 2:
      return `${rank}nd`;
    case 3:
      return `${rank}rd`;
    default:
      return `${rank}th`;
  }
}

export function formatScore(n: number): string {
  const digits = Math.abs(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return n < 0 ? `−${digits}` : digits;
}

export function formatDelta(n: number): string {
  return n < 0 ? formatScore(n) : `+${formatScore(n)}`;
}

export interface RoundTable {
  rounds: number[];
  /** cells[round][playerId] = sum of that player's entries in that round; absent if none. */
  cells: Record<number, Record<string, number>>;
}

export function roundTableOf(game: Game): RoundTable {
  const cells: Record<number, Record<string, number>> = {};
  for (const e of game.entries) {
    const row = (cells[e.round] ??= {});
    row[e.playerId] = (row[e.playerId] ?? 0) + e.delta;
  }
  const rounds = Array.from({ length: game.round }, (_, i) => i + 1);
  return { rounds, cells };
}

export function shareText(game: Game): string {
  const standings = standingsOf(game);
  const status = game.finishedAt !== null ? 'Final' : `Round ${game.round}`;
  const lines = standings.map((s) => `${s.rank}. ${s.player.name} — ${formatScore(s.total)}`);
  return [`${game.name} · ${status}`, ...lines, '', 'Scored with Chalk'].join('\n');
}

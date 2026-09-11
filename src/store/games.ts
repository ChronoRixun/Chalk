import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { PLAYER_COLORS } from '@/constants/theme';
import { newId } from '@/lib/id';
import type { Game, NewGameInput } from '@/types';

interface GamesState {
  games: Record<string, Game>;
  /** Names from the most recent game, used to prefill the next one. */
  lastPlayerNames: string[];
  /** True once persisted state has been loaded (or loading gave up). */
  hydrated: boolean;
  setHydrated: () => void;
  createGame: (input: NewGameInput) => string;
  addScore: (gameId: string, playerId: string, delta: number) => void;
  undo: (gameId: string) => void;
  nextRound: (gameId: string) => void;
  setDealer: (gameId: string, index: number) => void;
  finishGame: (gameId: string) => void;
  reopenGame: (gameId: string) => void;
  deleteGame: (gameId: string) => void;
}

export const useGamesStore = create<GamesState>()(
  persist(
    (set) => {
      const update = (gameId: string, fn: (game: Game) => Game) =>
        set((state) => {
          const game = state.games[gameId];
          if (!game) return state;
          return { games: { ...state.games, [gameId]: { ...fn(game), updatedAt: Date.now() } } };
        });

      return {
        games: {},
        lastPlayerNames: [],
        hydrated: false,
        setHydrated: () => set({ hydrated: true }),

        createGame: (input) => {
          const id = newId();
          const now = Date.now();
          const players = input.playerNames.map((raw, i) => ({
            id: newId(),
            name: raw.trim() || `Player ${i + 1}`,
            color: PLAYER_COLORS[i % PLAYER_COLORS.length],
          }));
          const game: Game = {
            id,
            name: input.name.trim() || 'Game',
            presetId: input.presetId,
            direction: input.direction,
            target: input.target,
            quickAdds: input.quickAdds,
            players,
            entries: [],
            round: 1,
            dealerIndex: 0,
            createdAt: now,
            updatedAt: now,
            finishedAt: null,
          };
          set((state) => ({
            games: { ...state.games, [id]: game },
            lastPlayerNames: players.map((p) => p.name),
          }));
          return id;
        },

        addScore: (gameId, playerId, delta) => {
          if (!Number.isFinite(delta) || delta === 0) return;
          update(gameId, (game) => ({
            ...game,
            entries: [...game.entries, { id: newId(), playerId, delta, round: game.round, at: Date.now() }],
          }));
        },

        undo: (gameId) => update(gameId, (game) => ({ ...game, entries: game.entries.slice(0, -1) })),

        nextRound: (gameId) =>
          update(gameId, (game) => ({
            ...game,
            round: game.round + 1,
            dealerIndex: game.players.length ? (game.dealerIndex + 1) % game.players.length : 0,
          })),

        setDealer: (gameId, index) =>
          update(gameId, (game) => ({
            ...game,
            dealerIndex: Math.max(0, Math.min(index, game.players.length - 1)),
          })),

        finishGame: (gameId) => update(gameId, (game) => ({ ...game, finishedAt: Date.now() })),

        reopenGame: (gameId) => update(gameId, (game) => ({ ...game, finishedAt: null })),

        deleteGame: (gameId) =>
          set((state) => {
            if (!state.games[gameId]) return state;
            const games = { ...state.games };
            delete games[gameId];
            return { games };
          }),
      };
    },
    {
      name: 'chalk.games.v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ games: state.games, lastPlayerNames: state.lastPlayerNames }),
      onRehydrateStorage: () => () => {
        useGamesStore.setState({ hydrated: true });
      },
    },
  ),
);

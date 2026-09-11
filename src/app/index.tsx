import { useRouter } from 'expo-router';
import { useState } from 'react';
import { SectionList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, FAB, IconButton, Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EmptyState } from '@/components/EmptyState';
import { formatScore, outcomeOf, standingsOf } from '@/lib/scoring';
import { useGamesStore } from '@/store/games';
import type { Game } from '@/types';

function summarize(game: Game): string {
  const standings = standingsOf(game);
  const top = standings[0];
  if (!top) return 'No players';
  if (game.finishedAt !== null) {
    const { winner } = outcomeOf(game);
    return winner
      ? `Final · ${winner.name} won with ${formatScore(top.total)}`
      : `Final · tied at ${formatScore(top.total)}`;
  }
  if (game.entries.length === 0) {
    return `Round ${game.round} · ${game.players.length} players · no scores yet`;
  }
  const lead = top.tied
    ? `tied at ${formatScore(top.total)}`
    : `${top.player.name} leads with ${formatScore(top.total)}`;
  return `Round ${game.round} · ${lead}`;
}

function GameRow({ game, onOpen, onDelete }: { game: Game; onOpen: () => void; onDelete: () => void }) {
  return (
    <Card mode="contained" style={styles.card} onPress={onOpen}>
      <Card.Title
        title={game.name}
        titleVariant="titleMedium"
        subtitle={summarize(game)}
        subtitleNumberOfLines={2}
        left={() => (
          <View style={styles.dots}>
            {game.players.slice(0, 4).map((p) => (
              <View key={p.id} style={[styles.dot, { backgroundColor: p.color }]} />
            ))}
          </View>
        )}
        right={() => <IconButton icon="delete-outline" onPress={onDelete} />}
      />
    </Card>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const games = useGamesStore((s) => s.games);
  const hydrated = useGamesStore((s) => s.hydrated);
  const deleteGame = useGamesStore((s) => s.deleteGame);
  const [pendingDelete, setPendingDelete] = useState<Game | null>(null);

  const all = Object.values(games).sort((a, b) => b.updatedAt - a.updatedAt);
  const active = all.filter((g) => g.finishedAt === null);
  const finished = all.filter((g) => g.finishedAt !== null);
  const sections = [
    ...(active.length ? [{ title: 'In progress', data: active }] : []),
    ...(finished.length ? [{ title: 'Finished', data: finished }] : []),
  ];

  if (!hydrated) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <SectionList
        sections={sections}
        keyExtractor={(g) => g.id}
        contentInsetAdjustmentBehavior="automatic"
        stickySectionHeadersEnabled={false}
        contentContainerStyle={[styles.list, { paddingBottom: 96 + insets.bottom }]}
        renderSectionHeader={({ section }) => (
          <Text variant="labelLarge" style={[styles.sectionHeader, { color: theme.colors.onSurfaceVariant }]}>
            {section.title}
          </Text>
        )}
        renderItem={({ item }) => (
          <GameRow
            game={item}
            onOpen={() => router.push({ pathname: '/game/[id]', params: { id: item.id } })}
            onDelete={() => setPendingDelete(item)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="scoreboard-outline"
            title="Nothing on the board"
            body="Start a game, add your players, and tap to score. Everything stays on this phone."
          />
        }
      />
      <FAB
        icon="plus"
        label="New game"
        style={[styles.fab, { bottom: insets.bottom + 16 }]}
        onPress={() => router.push('/new-game')}
      />
      <ConfirmDialog
        visible={pendingDelete !== null}
        title="Delete game?"
        message={pendingDelete ? `"${pendingDelete.name}" and its scores will be removed.` : ''}
        confirmLabel="Delete"
        destructive
        onDismiss={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) deleteGame(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingTop: 8 },
  sectionHeader: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  card: { marginHorizontal: 16, marginBottom: 10 },
  dots: {
    width: 40,
    height: 40,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    alignContent: 'center',
    justifyContent: 'center',
  },
  dot: { width: 14, height: 14, borderRadius: 7 },
  fab: { position: 'absolute', right: 16 },
});

import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { DataTable, List, Text, useTheme } from 'react-native-paper';

import { EmptyState } from '@/components/EmptyState';
import { formatDelta, formatScore, roundTableOf, totalsOf } from '@/lib/scoring';
import { useGamesStore } from '@/store/games';

const RECENT_LIMIT = 30;

function timeOf(epochMs: number): string {
  const d = new Date(epochMs);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const suffix = h >= 12 ? 'PM' : 'AM';
  return `${((h + 11) % 12) + 1}:${m} ${suffix}`;
}

export default function HistoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const game = useGamesStore((s) => (id ? s.games[id] : undefined));

  if (!game) {
    return <EmptyState icon="eraser" title="This game was erased" body="It is no longer on this phone." />;
  }

  const { rounds, cells } = roundTableOf(game);
  const totals = totalsOf(game);
  const nameById = Object.fromEntries(game.players.map((p) => [p.id, p.name]));
  const recent = [...game.entries].reverse().slice(0, RECENT_LIMIT);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <DataTable style={styles.table}>
          <DataTable.Header>
            <DataTable.Title style={styles.roundCol}>Round</DataTable.Title>
            {game.players.map((p) => (
              <DataTable.Title key={p.id} numeric style={styles.playerCol}>
                {p.name}
              </DataTable.Title>
            ))}
          </DataTable.Header>
          {rounds.map((r) => (
            <DataTable.Row key={r}>
              <DataTable.Cell style={styles.roundCol}>{r}</DataTable.Cell>
              {game.players.map((p) => {
                const v = cells[r]?.[p.id];
                return (
                  <DataTable.Cell key={p.id} numeric style={styles.playerCol} textStyle={styles.num}>
                    {v === undefined ? '–' : formatDelta(v)}
                  </DataTable.Cell>
                );
              })}
            </DataTable.Row>
          ))}
          <DataTable.Row style={{ backgroundColor: theme.colors.surfaceVariant }}>
            <DataTable.Cell style={styles.roundCol} textStyle={styles.bold}>
              Total
            </DataTable.Cell>
            {game.players.map((p) => (
              <DataTable.Cell key={p.id} numeric style={styles.playerCol} textStyle={[styles.num, styles.bold]}>
                {formatScore(totals[p.id])}
              </DataTable.Cell>
            ))}
          </DataTable.Row>
        </DataTable>
      </ScrollView>

      <Text variant="titleMedium" style={styles.sectionTitle}>
        Recent entries
      </Text>
      {recent.length === 0 ? (
        <Text variant="bodyMedium" style={[styles.empty, { color: theme.colors.onSurfaceVariant }]}>
          No scores yet.
        </Text>
      ) : (
        <View>
          {recent.map((e) => (
            <List.Item
              key={e.id}
              title={`${nameById[e.playerId] ?? 'Player'}  ${formatDelta(e.delta)}`}
              titleStyle={styles.num}
              description={`Round ${e.round} · ${timeOf(e.at)}`}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingVertical: 8, paddingBottom: 48 },
  table: { minWidth: '100%' },
  roundCol: { minWidth: 72 },
  playerCol: { minWidth: 96 },
  num: { fontVariant: ['tabular-nums'] },
  bold: { fontWeight: '700' },
  sectionTitle: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8 },
  empty: { paddingHorizontal: 16 },
});

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { Avatar, Chip, Surface, Text, useTheme } from 'react-native-paper';

import { formatScore, rankLabel } from '@/lib/scoring';
import type { Player } from '@/types';

interface Props {
  player: Player;
  total: number;
  rank: number;
  tied: boolean;
  isLeader: boolean;
  isDealer: boolean;
  quickAdds: number[];
  sign: 1 | -1;
  /** Finished games show totals only. */
  locked: boolean;
  onAdd: (delta: number) => void;
  onCustom: () => void;
  onLongPress: () => void;
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.map((p) => p[0]).join('').slice(0, 2).toUpperCase();
  return letters || '?';
}

export function PlayerCard({
  player,
  total,
  rank,
  tied,
  isLeader,
  isDealer,
  quickAdds,
  sign,
  locked,
  onAdd,
  onCustom,
  onLongPress,
}: Props) {
  const theme = useTheme();
  const status = [rankLabel(rank) + (tied ? ' (tied)' : ''), isDealer ? 'Dealer' : null]
    .filter(Boolean)
    .join(' · ');

  return (
    <Pressable onLongPress={onLongPress} delayLongPress={350} disabled={locked}>
      {({ pressed }) => (
        <Surface
          elevation={1}
          style={[
            styles.card,
            { borderColor: isLeader ? player.color : 'transparent', opacity: pressed ? 0.85 : 1 },
          ]}>
          <View style={[styles.stripe, { backgroundColor: player.color }]} />
          <View style={styles.body}>
            <View style={styles.topRow}>
              <Avatar.Text
                size={40}
                label={initialsOf(player.name)}
                style={{ backgroundColor: player.color }}
                color="#1B2320"
              />
              <View style={styles.nameBlock}>
                <View style={styles.nameRow}>
                  <Text variant="titleMedium" numberOfLines={1} style={styles.name}>
                    {player.name}
                  </Text>
                  {isLeader && <MaterialCommunityIcons name="crown" size={18} color={player.color} />}
                </View>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {status}
                </Text>
              </View>
              <Text variant="displaySmall" style={styles.total}>
                {formatScore(total)}
              </Text>
            </View>

            {!locked && (
              <View style={styles.chips}>
                {quickAdds.map((n) => (
                  <Chip
                    key={n}
                    compact
                    mode="outlined"
                    onPress={() => onAdd(sign * n)}
                    textStyle={styles.chipText}>
                    {sign > 0 ? `+${n}` : `−${n}`}
                  </Chip>
                ))}
                <Chip compact mode="outlined" icon="dots-horizontal" onPress={onCustom}>
                  Other
                </Chip>
              </View>
            )}
          </View>
        </Surface>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  stripe: { width: 6 },
  body: { flex: 1, padding: 14, gap: 12 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  nameBlock: { flex: 1, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { flexShrink: 1 },
  total: { fontWeight: '700', fontVariant: ['tabular-nums'] },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chipText: { fontVariant: ['tabular-nums'], fontWeight: '600' },
});

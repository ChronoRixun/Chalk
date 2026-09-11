import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useKeepAwake } from 'expo-keep-awake';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Platform, Share, StyleSheet, View } from 'react-native';
import {
  Button,
  Chip,
  IconButton,
  SegmentedButtons,
  Snackbar,
  Surface,
  Text,
  useTheme,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActionSheetDialog, type SheetAction } from '@/components/ActionSheetDialog';
import { AmountDialog } from '@/components/AmountDialog';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EmptyState } from '@/components/EmptyState';
import { PlayerCard } from '@/components/PlayerCard';
import { success, tap, thud } from '@/lib/haptics';
import { formatDelta, formatScore, outcomeOf, shareText, standingsOf } from '@/lib/scoring';
import { useGamesStore } from '@/store/games';
import type { Player } from '@/types';

/**
 * Keeps the screen on while a game is open. Native only: the browser Wake Lock API throws when a
 * lock is released before it finishes activating, which fast refresh triggers constantly.
 */
function KeepAwake() {
  useKeepAwake('chalk-game', { suppressDeactivateWarnings: true });
  return null;
}

export default function GameScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const game = useGamesStore((s) => (id ? s.games[id] : undefined));
  const addScore = useGamesStore((s) => s.addScore);
  const undo = useGamesStore((s) => s.undo);
  const nextRound = useGamesStore((s) => s.nextRound);
  const setDealer = useGamesStore((s) => s.setDealer);
  const finishGame = useGamesStore((s) => s.finishGame);
  const reopenGame = useGamesStore((s) => s.reopenGame);
  const deleteGame = useGamesStore((s) => s.deleteGame);

  const [sign, setSign] = useState<1 | -1>(1);
  const [customFor, setCustomFor] = useState<Player | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirm, setConfirm] = useState<'finish' | 'delete' | null>(null);
  const [snack, setSnack] = useState<string | null>(null);

  if (!game) {
    return (
      <>
        <Stack.Screen options={{ title: 'Game' }} />
        <EmptyState icon="eraser" title="This game was erased" body="It is no longer on this phone." />
      </>
    );
  }

  const standings = standingsOf(game);
  const standingById = Object.fromEntries(standings.map((s) => [s.player.id, s]));
  const outcome = outcomeOf(game);
  const finished = game.finishedAt !== null;
  const dealer = game.players[game.dealerIndex];
  const canUndo = game.entries.length > 0 && !finished;
  const ruleLine = [
    game.direction === 'high' ? 'High score wins' : 'Low score wins',
    game.target !== null ? `playing to ${formatScore(game.target)}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  function goHome() {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }

  function onAdd(player: Player, delta: number) {
    if (!game) return;
    addScore(game.id, player.id, delta);
    tap();
  }

  function onUndo() {
    if (!game || !canUndo) return;
    const last = game.entries[game.entries.length - 1];
    const who = game.players.find((p) => p.id === last.playerId);
    undo(game.id);
    thud();
    setSnack(`Undid ${who?.name ?? 'entry'} ${formatDelta(last.delta)}`);
  }

  function onNextRound() {
    if (!game) return;
    nextRound(game.id);
    thud();
  }

  function onSetDealer(index: number) {
    if (!game) return;
    setDealer(game.id, index);
    thud();
    setSnack(`${game.players[index].name} is now the dealer`);
  }

  async function onShare() {
    if (!game) return;
    try {
      await Share.share({ message: shareText(game), title: game.name });
    } catch {
      setSnack('Sharing is not available here.');
    }
  }

  const header = (
    <View style={styles.header}>
      <Surface elevation={0} style={[styles.roundBar, { backgroundColor: theme.colors.surfaceVariant }]}>
        <View style={styles.roundText}>
          <Text variant="titleMedium">{finished ? 'Final' : `Round ${game.round}`}</Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {ruleLine}
          </Text>
        </View>
        {dealer && !finished && (
          <Chip compact icon="cards-playing-outline">
            {dealer.name} deals
          </Chip>
        )}
      </Surface>

      {outcome.over && (
        <Surface elevation={0} style={[styles.banner, { backgroundColor: theme.colors.primaryContainer }]}>
          <MaterialCommunityIcons name="trophy" size={30} color={theme.colors.onPrimaryContainer} />
          <View style={styles.bannerText}>
            <Text variant="titleMedium" style={{ color: theme.colors.onPrimaryContainer }}>
              {outcome.winner ? `${outcome.winner.name} wins!` : 'Tied at the top'}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onPrimaryContainer }}>
              {finished
                ? 'Game finished'
                : game.target !== null
                  ? `Someone reached ${formatScore(game.target)}`
                  : ''}
            </Text>
          </View>
          {!finished && (
            <Button mode="contained" compact onPress={() => setConfirm('finish')}>
              Finish
            </Button>
          )}
        </Surface>
      )}
    </View>
  );

  const sheetActions: SheetAction[] = [
    {
      key: 'rounds',
      label: 'Round history',
      icon: 'table',
      onPress: () => router.push({ pathname: '/game/[id]/history', params: { id: game.id } }),
    },
    { key: 'share', label: 'Share standings', icon: 'share-variant', onPress: onShare },
    finished
      ? { key: 'reopen', label: 'Reopen game', icon: 'lock-open-variant-outline', onPress: () => reopenGame(game.id) }
      : { key: 'finish', label: 'Finish game', icon: 'flag-checkered', onPress: () => setConfirm('finish') },
    { key: 'delete', label: 'Delete game', icon: 'delete-outline', destructive: true, onPress: () => setConfirm('delete') },
  ];

  return (
    <View style={styles.screen}>
      {Platform.OS !== 'web' && <KeepAwake />}
      <Stack.Screen
        options={{
          title: game.name,
          headerRight: () => (
            <View style={styles.headerActions}>
              <IconButton icon="undo-variant" disabled={!canUndo} onPress={onUndo} />
              <IconButton icon="dots-vertical" onPress={() => setMenuOpen(true)} />
            </View>
          ),
        }}
      />

      {/* The snackbar anchors to this inner view so it never covers the bottom bar. */}
      <View style={styles.flex}>
        <FlatList
          data={game.players}
          keyExtractor={(p) => p.id}
          ListHeaderComponent={header}
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => {
            const standing = standingById[item.id];
            return (
              <PlayerCard
                player={item}
                total={standing.total}
                rank={standing.rank}
                tied={standing.tied}
                isLeader={standing.rank === 1 && !standing.tied && game.entries.length > 0}
                isDealer={index === game.dealerIndex}
                quickAdds={game.quickAdds}
                sign={sign}
                locked={finished}
                onAdd={(delta) => onAdd(item, delta)}
                onCustom={() => setCustomFor(item)}
                onLongPress={() => onSetDealer(index)}
              />
            );
          }}
          ListFooterComponent={
            !finished ? (
              <Text variant="bodySmall" style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
                Hold a player to make them the dealer.
              </Text>
            ) : null
          }
        />
        <Snackbar visible={snack !== null} onDismiss={() => setSnack(null)} duration={2200}>
          {snack ?? ''}
        </Snackbar>
      </View>

      <Surface elevation={2} style={[styles.bottomBar, { paddingBottom: insets.bottom + 10 }]}>
        {finished ? (
          <Button
            mode="outlined"
            icon="lock-open-variant-outline"
            onPress={() => reopenGame(game.id)}
            style={styles.flex}>
            Reopen game
          </Button>
        ) : (
          <>
            <SegmentedButtons
              density="small"
              value={sign === 1 ? 'add' : 'sub'}
              onValueChange={(v) => setSign(v === 'sub' ? -1 : 1)}
              buttons={[
                { value: 'add', icon: 'plus', label: 'Add' },
                { value: 'sub', icon: 'minus', label: 'Subtract' },
              ]}
              style={styles.flex}
            />
            <Button mode="contained-tonal" icon="skip-next" onPress={onNextRound}>
              Next round
            </Button>
          </>
        )}
      </Surface>

      <AmountDialog
        visible={customFor !== null}
        playerName={customFor?.name ?? null}
        onDismiss={() => setCustomFor(null)}
        onSubmit={(delta) => {
          if (customFor) onAdd(customFor, delta);
          setCustomFor(null);
        }}
      />
      <ActionSheetDialog
        visible={menuOpen}
        title={game.name}
        actions={sheetActions}
        onDismiss={() => setMenuOpen(false)}
      />
      <ConfirmDialog
        visible={confirm === 'finish'}
        title="Finish game?"
        message="Scores lock and the game moves to Finished. You can reopen it later."
        confirmLabel="Finish"
        onDismiss={() => setConfirm(null)}
        onConfirm={() => {
          finishGame(game.id);
          success();
          setConfirm(null);
        }}
      />
      <ConfirmDialog
        visible={confirm === 'delete'}
        title="Delete game?"
        message="This removes the game and every score in it."
        confirmLabel="Delete"
        destructive
        onDismiss={() => setConfirm(null)}
        onConfirm={() => {
          setConfirm(null);
          deleteGame(game.id);
          goHome();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flex: { flex: 1 },
  headerActions: { flexDirection: 'row' },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4, gap: 12 },
  roundBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: 14,
    borderRadius: 16,
  },
  roundText: { flex: 1, gap: 2 },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16 },
  bannerText: { flex: 1, gap: 2 },
  list: { paddingBottom: 24 },
  hint: { textAlign: 'center', paddingVertical: 8 },
  bottomBar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 10 },
});

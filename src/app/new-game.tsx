import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Chip, HelperText, SegmentedButtons, Text, TextInput, useTheme } from 'react-native-paper';

import { getPreset, PRESETS, type Preset } from '@/constants/presets';
import { success } from '@/lib/haptics';
import { newId } from '@/lib/id';
import { useGamesStore } from '@/store/games';
import type { ScoringDirection } from '@/types';

interface PlayerDraft {
  key: string;
  name: string;
}

const MAX_PLAYERS = 12;

export default function NewGameScreen() {
  const router = useRouter();
  const theme = useTheme();
  const createGame = useGamesStore((s) => s.createGame);
  const lastPlayerNames = useGamesStore((s) => s.lastPlayerNames);

  const [presetId, setPresetId] = useState(PRESETS[0].id);
  const [name, setName] = useState(PRESETS[0].name);
  const [nameTouched, setNameTouched] = useState(false);
  const [direction, setDirection] = useState<ScoringDirection>(PRESETS[0].direction);
  const [target, setTarget] = useState('');
  const [players, setPlayers] = useState<PlayerDraft[]>(() =>
    (lastPlayerNames.length >= 2 ? lastPlayerNames : ['', '']).map((n) => ({ key: newId(), name: n })),
  );

  const preset = getPreset(presetId);

  function choosePreset(p: Preset) {
    setPresetId(p.id);
    setDirection(p.direction);
    setTarget(p.target === null ? '' : String(p.target));
    if (!nameTouched) setName(p.name);
  }

  function updatePlayer(key: string, value: string) {
    setPlayers((ps) => ps.map((p) => (p.key === key ? { ...p, name: value } : p)));
  }

  function removePlayer(key: string) {
    setPlayers((ps) => ps.filter((p) => p.key !== key));
  }

  function addPlayer() {
    setPlayers((ps) => (ps.length >= MAX_PLAYERS ? ps : [...ps, { key: newId(), name: '' }]));
  }

  const parsedTarget = Number.parseInt(target.replace(/[^\d]/g, ''), 10);
  const targetValue = Number.isFinite(parsedTarget) && parsedTarget > 0 ? parsedTarget : null;
  const canStart = players.length >= 2;

  function start() {
    const id = createGame({
      name,
      presetId,
      direction,
      target: targetValue,
      quickAdds: preset.quickAdds,
      playerNames: players.map((p) => p.name),
    });
    success();
    router.replace({ pathname: '/game/[id]', params: { id } });
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen
        options={{
          headerLeft: () => <Button onPress={() => router.back()}>Cancel</Button>,
        }}
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text variant="titleMedium">Game</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {PRESETS.map((p) => (
            <Chip
              key={p.id}
              selected={p.id === presetId}
              mode={p.id === presetId ? 'flat' : 'outlined'}
              onPress={() => choosePreset(p)}>
              {p.name}
            </Chip>
          ))}
        </ScrollView>
        <HelperText type="info" visible style={styles.helper}>
          {preset.description}
        </HelperText>
        <TextInput
          mode="outlined"
          label="Name"
          value={name}
          onChangeText={(t) => {
            setName(t);
            setNameTouched(true);
          }}
        />

        <Text variant="titleMedium" style={styles.sectionTitle}>
          Scoring
        </Text>
        <SegmentedButtons
          value={direction}
          onValueChange={(v) => setDirection(v === 'low' ? 'low' : 'high')}
          buttons={[
            { value: 'high', label: 'High score wins', icon: 'arrow-up-bold' },
            { value: 'low', label: 'Low score wins', icon: 'arrow-down-bold' },
          ]}
        />
        <TextInput
          mode="outlined"
          label="Play to"
          placeholder="No limit"
          value={target}
          onChangeText={setTarget}
          keyboardType="number-pad"
        />
        <HelperText type="info" visible style={styles.helper}>
          {targetValue === null
            ? 'The game runs until you tap Finish.'
            : direction === 'high'
              ? `First player to reach ${targetValue} wins.`
              : `When anyone reaches ${targetValue}, the lowest score wins.`}
        </HelperText>

        <Text variant="titleMedium" style={styles.sectionTitle}>
          Players
        </Text>
        <View style={styles.players}>
          {players.map((p, i) => (
            <TextInput
              key={p.key}
              mode="outlined"
              label={`Player ${i + 1}`}
              value={p.name}
              onChangeText={(t) => updatePlayer(p.key, t)}
              autoCapitalize="words"
              returnKeyType="next"
              right={
                players.length > 2 ? (
                  <TextInput.Icon icon="close" onPress={() => removePlayer(p.key)} />
                ) : undefined
              }
            />
          ))}
        </View>
        <Button
          icon="account-plus-outline"
          mode="text"
          disabled={players.length >= MAX_PLAYERS}
          onPress={addPlayer}
          style={styles.addPlayer}>
          Add player
        </Button>

        <Button mode="contained" icon="play" disabled={!canStart} onPress={start} style={styles.start}>
          Start game
        </Button>
        <Text variant="bodySmall" style={[styles.footnote, { color: theme.colors.onSurfaceVariant }]}>
          Blank names become Player 1, Player 2, and so on.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 48 },
  chipRow: { gap: 8, paddingVertical: 4 },
  helper: { paddingHorizontal: 0, marginTop: -8 },
  sectionTitle: { marginTop: 12 },
  players: { gap: 10 },
  addPlayer: { alignSelf: 'flex-start' },
  start: { marginTop: 16 },
  footnote: { textAlign: 'center' },
});

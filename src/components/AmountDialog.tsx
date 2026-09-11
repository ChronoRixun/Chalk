import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Button, Dialog, Portal, SegmentedButtons, TextInput } from 'react-native-paper';

interface Props {
  visible: boolean;
  playerName: string | null;
  onSubmit: (delta: number) => void;
  onDismiss: () => void;
}

/** Enter an arbitrary positive or negative amount for one player. */
export function AmountDialog({ visible, playerName, onSubmit, onDismiss }: Props) {
  const [text, setText] = useState('');
  const [sign, setSign] = useState<'add' | 'sub'>('add');

  useEffect(() => {
    if (visible) {
      setText('');
      setSign('add');
    }
  }, [visible]);

  const amount = Number.parseInt(text.replace(/[^\d]/g, ''), 10);
  const valid = Number.isFinite(amount) && amount > 0;

  function submit() {
    if (!valid) return;
    onSubmit(sign === 'sub' ? -amount : amount);
  }

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>{playerName ? `Score for ${playerName}` : 'Score'}</Dialog.Title>
        <Dialog.Content style={styles.content}>
          <SegmentedButtons
            value={sign}
            onValueChange={(v) => setSign(v === 'sub' ? 'sub' : 'add')}
            density="small"
            buttons={[
              { value: 'add', label: 'Add', icon: 'plus' },
              { value: 'sub', label: 'Subtract', icon: 'minus' },
            ]}
          />
          <TextInput
            mode="outlined"
            label="Points"
            value={text}
            onChangeText={setText}
            keyboardType="number-pad"
            autoFocus
            returnKeyType="done"
            onSubmitEditing={submit}
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Cancel</Button>
          <Button mode="contained" disabled={!valid} onPress={submit}>
            {sign === 'sub' ? 'Subtract' : 'Add'}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  content: { gap: 16 },
});

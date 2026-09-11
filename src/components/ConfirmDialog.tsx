import { Button, Dialog, Portal, Text, useTheme } from 'react-native-paper';

interface Props {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'OK',
  destructive = false,
  onConfirm,
  onDismiss,
}: Props) {
  const theme = useTheme();
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">{message}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Cancel</Button>
          <Button textColor={destructive ? theme.colors.error : undefined} onPress={onConfirm}>
            {confirmLabel}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

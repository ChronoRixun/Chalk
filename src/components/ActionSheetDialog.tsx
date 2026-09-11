import { StyleSheet } from 'react-native';
import { Dialog, List, Portal, useTheme } from 'react-native-paper';

export interface SheetAction {
  key: string;
  label: string;
  icon: string;
  destructive?: boolean;
  onPress: () => void;
}

interface Props {
  visible: boolean;
  title: string;
  actions: SheetAction[];
  onDismiss: () => void;
}

/** A dialog styled as a simple action list. Behaves identically on iOS, Android, and web. */
export function ActionSheetDialog({ visible, title, actions, onDismiss }: Props) {
  const theme = useTheme();
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Content style={styles.content}>
          {actions.map((action) => (
            <List.Item
              key={action.key}
              title={action.label}
              titleStyle={action.destructive ? { color: theme.colors.error } : undefined}
              left={(props) => (
                <List.Icon
                  {...props}
                  icon={action.icon}
                  color={action.destructive ? theme.colors.error : props.color}
                />
              )}
              onPress={() => {
                onDismiss();
                action.onPress();
              }}
            />
          ))}
        </Dialog.Content>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 0 },
});

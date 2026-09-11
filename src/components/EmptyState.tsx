import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

interface Props {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  body: string;
}

export function EmptyState({ icon, title, body }: Props) {
  const theme = useTheme();
  return (
    <View style={styles.wrap}>
      <MaterialCommunityIcons name={icon} size={56} color={theme.colors.onSurfaceVariant} />
      <Text variant="headlineSmall" style={styles.title}>
        {title}
      </Text>
      <Text variant="bodyMedium" style={[styles.body, { color: theme.colors.onSurfaceVariant }]}>
        {body}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingHorizontal: 32, paddingVertical: 72, gap: 12 },
  title: { textAlign: 'center' },
  body: { textAlign: 'center' },
});

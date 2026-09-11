import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { resolveThemes } from '@/constants/theme';
import { useGamesStore } from '@/store/games';

SplashScreen.preventAutoHideAsync().catch(() => {});

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

/** Route Paper's icons through @expo/vector-icons so the font loads on every platform, web included. */
const paperSettings = {
  icon: (props: { name: string; color?: string; size: number; allowFontScaling?: boolean; testID?: string }) => (
    <MaterialCommunityIcons
      name={props.name as IconName}
      color={props.color}
      size={props.size}
      allowFontScaling={props.allowFontScaling}
      testID={props.testID}
    />
  ),
};

export default function RootLayout() {
  const scheme = useColorScheme();
  const { paper, navigation, isDark } = resolveThemes(scheme);
  const hydrated = useGamesStore((s) => s.hydrated);

  useEffect(() => {
    if (hydrated) SplashScreen.hideAsync().catch(() => {});
  }, [hydrated]);

  // Never leave the splash up forever if storage is slow or broken.
  useEffect(() => {
    const timer = setTimeout(() => useGamesStore.getState().setHydrated(), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={paper} settings={paperSettings}>
        <ThemeProvider value={navigation}>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <Stack
            screenOptions={{
              headerTitleStyle: { fontWeight: '700' },
              headerBackButtonDisplayMode: 'minimal',
              contentStyle: { backgroundColor: paper.colors.background },
            }}>
            <Stack.Screen name="index" options={{ title: 'Chalk', headerLargeTitle: true }} />
            <Stack.Screen name="new-game" options={{ title: 'New game', presentation: 'modal' }} />
            <Stack.Screen name="game/[id]/index" options={{ title: '' }} />
            <Stack.Screen name="game/[id]/history" options={{ title: 'Rounds', presentation: 'modal' }} />
          </Stack>
        </ThemeProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

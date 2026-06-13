import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, router, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MD3DarkTheme, MD3LightTheme, PaperProvider, adaptNavigationTheme } from 'react-native-paper';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import LocalStorage from '@/src/providers/LocalStorage';
import { AuthProvider, useAuth } from '@/src/contexts/AuthContext';

function InitialLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (isLoading || !navigationState?.key) return;

    const inAuthGroup = segments[0] === 'login';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to the login page if the user is not authenticated.
      router.replace('/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect away from the login page if the user is authenticated.
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments, navigationState?.key]);

  if (isLoading) return null;

  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Pomotask' }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    LocalStorage.init().then(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') {
      document.title = 'Pomotask';
    }
  }, []);

  if (!loaded) return null;

  const customLightTheme = {
    ...MD3LightTheme,
    roundness: 3,
    colors: {
      ...MD3LightTheme.colors,
      primary:            '#6264A7',
      onPrimary:          '#FFFFFF',
      primaryContainer:   '#EEEEF7',
      onPrimaryContainer: '#464775',
      secondary:          '#2196F3',
      secondaryContainer: '#E3F2FD',
      background:         '#F7F8FC',
      surface:            '#FFFFFF',
      surfaceVariant:     '#F3F4F6',
      onSurface:          '#111827',
      onSurfaceVariant:   '#6B7280',
      outline:            '#D1D5DB',
      outlineVariant:     '#E5E7EB',
      error:              '#EA4335',
      onError:            '#FFFFFF',
    },
  };

  const customDarkTheme = {
    ...MD3DarkTheme,
    roundness: 3,
    colors: {
      ...MD3DarkTheme.colors,
      primary:          '#8B8DC4',
      onPrimary:        '#FFFFFF',
      primaryContainer: '#464775',
    },
  };

  const paperTheme = colorScheme === 'dark' ? customDarkTheme : customLightTheme;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <PaperProvider theme={paperTheme}>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <InitialLayout />
            <StatusBar style="auto" />
          </ThemeProvider>
        </PaperProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

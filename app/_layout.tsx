import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider, useTheme } from '@/context/CustomThemeContext';
import { StoreProvider, useStore } from '@/store';
import { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DeviceEventEmitter } from 'react-native';
import { ToastProvider } from '@/context/ToastContext';
import { KeyboardProvider } from 'react-native-keyboard-controller';

export const unstable_settings = {
  anchor: '(tabs)',
};

SplashScreen.setOptions({
  duration: 1000,
});

SplashScreen.preventAutoHideAsync();

function RootLayoutInner() {
  const { isDark } = useTheme();
  const { store, dispatch } = useStore();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    import('@/utils/secureStorage').then(({ getItemAsync }) => {
      Promise.all([
        getItemAsync('authToken'),
        getItemAsync('authUserId'),
        getItemAsync('authEmail'),
      ]).then(([token, id, email]) => {
        if (id) {
          (dispatch as any)({
            type: "SET_AUTH_USER_ID",
            payload: { userId: id },
          });
        }
        if (email) {
          (dispatch as any)({
            type: "SET_AUTH_EMAIL",
            payload: { email },
          });
        }
        if (token) {
          (dispatch as any)({
            type: "SET_AUTH_TOKEN",
            payload: { authToken: token },
          });
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      });
    });
  }, []);

  // Sync state if user logs in
  useEffect(() => {
    if (store.auth.authToken) {
      setIsLoggedIn(true);
    }
  }, [store.auth.authToken]);

  // Sync state if user logs out
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('logout', () => {
      setIsLoggedIn(false);
    });
    return () => sub.remove();
  }, []);

  if (isLoggedIn === null) return null;

  return (
    <>
      <KeyboardProvider>
        <GestureHandlerRootView>
          <ToastProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Protected guard={isLoggedIn}>
                <Stack.Screen name="(protected)" options={{ headerShown: false }} />
              </Stack.Protected>
              <Stack.Protected guard={!isLoggedIn}>
                <Stack.Screen name="login" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(forgetPassword)" options={{ headerShown: false }} />
              </Stack.Protected>
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            </Stack>
          </ToastProvider>
        </GestureHandlerRootView>
      </KeyboardProvider>

      {/* Status bar reacts to theme correctly */}
      <StatusBar style={isDark ? "light" : "dark"} />
    </>
  );
}

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [fontsLoaded] = useFonts({
    OpenSansRegular: require('../assets/fonts/OpenSans-Regular.ttf'),
    OpenSansBold: require('../assets/fonts/OpenSans-Bold.ttf'),
    OpenSansSemi: require('../assets/fonts/OpenSans-SemiBold.ttf'),
    OpenSansExtra: require('../assets/fonts/OpenSans-ExtraBold.ttf'),
    OpenSansMedium: require('../assets/fonts/OpenSans-Medium.ttf'),
    OpenSansLight: require('../assets/fonts/OpenSans-Light.ttf'),
    OpenSansItalic: require('../assets/fonts/OpenSans-Italic.ttf')
  });

  useEffect(() => {
    async function prepare() {
      try {
        await new Promise(resolve => setTimeout(resolve, 50));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady && fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady, fontsLoaded]);

  if (!appIsReady || !fontsLoaded) {
    return null;
  }

  // 👇 Wrap everything in ThemeProvider
  return (
    <ThemeProvider>
      <StoreProvider>
        <RootLayoutInner />
      </StoreProvider>
    </ThemeProvider>
  );
}

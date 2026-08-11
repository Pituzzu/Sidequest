import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  DarkTheme,
  DefaultTheme,
  LinkingOptions,
  NavigationContainer,
} from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { useEffect, useRef, useState } from 'react';
import { Animated, Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import Login from './Login';
import MainTabs from './MainTabs';
import RecoverCredentials from './recupero_nick';
import { RootStackParamList } from './routes';
import { ThemeProvider, useAppTheme } from './ThemeContext';
import { AuthProvider, useAuth } from './AuthContext';
import { EventStoreProvider } from './EventStoreContext';
import BackIcon from './assets/back.svg';

const Stack = createNativeStackNavigator<RootStackParamList>();

if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync().catch(() => {});
}

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['sidequest://'],
  config: {
    screens: {
      Home: '',
      Login: 'login',
      RecoverCredentials: 'recupero-credenziali',
      Main: {
        path: '',
        screens: {
          Events: 'events',
          Games: 'games',
          Home: 'home',
          Users: 'users',
          Settings: 'settings',
        },
      },
    },
  },
};

type HomeProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

function StartupSplash({ onFinish }: { onFinish: () => void }) {
  const logoAppearance = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (Platform.OS !== 'web') {
      SplashScreen.hideAsync().catch(() => {});
    }

    const animation = Animated.sequence([
      Animated.delay(80),
      Animated.spring(logoAppearance, {
        friction: 6,
        tension: 48,
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.delay(720),
      Animated.timing(overlayOpacity, {
        duration: 380,
        toValue: 0,
        useNativeDriver: true,
      }),
    ]);

    animation.start(({ finished }) => {
      if (finished) onFinish();
    });

    return () => animation.stop();
  }, [logoAppearance, onFinish, overlayOpacity]);

  const logoScale = logoAppearance.interpolate({
    inputRange: [0, 0.72, 1],
    outputRange: [0.38, 1.08, 1],
  });
  const logoRotation = logoAppearance.interpolate({
    inputRange: [0, 1],
    outputRange: ['-12deg', '0deg'],
  });
  const ringScale = logoAppearance.interpolate({
    inputRange: [0, 1],
    outputRange: [0.45, 1.22],
  });
  const ringOpacity = logoAppearance.interpolate({
    inputRange: [0, 0.45, 1],
    outputRange: [0, 0.42, 0],
  });

  return (
    <Animated.View style={[styles.startupOverlay, { opacity: overlayOpacity }]}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.startupRing,
          { opacity: ringOpacity, transform: [{ scale: ringScale }] },
        ]}
      />
      <Animated.Image
        accessibilityLabel="Logo Side Quest Trieste"
        resizeMode="contain"
        source={require('./assets/logo.png')}
        style={[
          styles.startupLogo,
          {
            opacity: logoAppearance,
            transform: [{ scale: logoScale }, { rotate: logoRotation }],
          },
        ]}
      />
      <StatusBar style="light" />
    </Animated.View>
  );
}

function Home({ navigation }: HomeProps) {
  const { colors, isDark, t } = useAppTheme();
  const wavesEntrance = useRef(new Animated.Value(0)).current;
  const logoEntrance = useRef(new Animated.Value(0)).current;
  const buttonEntrance = useRef(new Animated.Value(0)).current;
  const logoFloat = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const entrance = Animated.parallel([
      Animated.timing(wavesEntrance, {
        duration: 720,
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(130),
        Animated.spring(logoEntrance, {
          friction: 7,
          tension: 52,
          toValue: 1,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.delay(590),
        Animated.timing(buttonEntrance, {
          duration: 430,
          toValue: 1,
          useNativeDriver: true,
        }),
      ]),
    ]);

    const floating = Animated.loop(
      Animated.sequence([
        Animated.timing(logoFloat, {
          duration: 1700,
          toValue: -7,
          useNativeDriver: true,
        }),
        Animated.timing(logoFloat, {
          duration: 1700,
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    entrance.start(({ finished }) => {
      if (finished) floating.start();
    });

    return () => {
      entrance.stop();
      floating.stop();
    };
  }, [buttonEntrance, logoEntrance, logoFloat, wavesEntrance]);

  const logoScale = logoEntrance.interpolate({
    inputRange: [0, 1],
    outputRange: [0.68, 1],
  });
  const logoLift = logoEntrance.interpolate({
    inputRange: [0, 1],
    outputRange: [34, 0],
  });
  const buttonLift = buttonEntrance.interpolate({
    inputRange: [0, 1],
    outputRange: [24, 0],
  });
  const topWaveSlide = wavesEntrance.interpolate({
    inputRange: [0, 1],
    outputRange: [-95, 0],
  });
  const bottomWaveSlide = wavesEntrance.interpolate({
    inputRange: [0, 1],
    outputRange: [125, 0],
  });

  return (
    <View style={[styles.screen, { backgroundColor: isDark ? colors.background : '#5372B5' }]}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.topWave,
          { opacity: wavesEntrance, transform: [{ translateY: topWaveSlide }] },
        ]}
      >
        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 402 93"
          preserveAspectRatio="none"
        >
          <Path
            d="M403.22 16.8494L389.82 26.3286C376.42 35.8078 349.621 54.7663 322.808 70.6027C295.995 86.2036 269.171 99.2716 242.256 89.7792C215.342 80.6402 188.337 48.9409 161.423 39.8019C134.508 30.3096 107.684 43.3775 80.7944 40.129C53.9054 37.1161 26.9527 18.3757 13.4764 9.00553L0 -0.364656L13.4381 -0.419166C26.8763 -0.473677 53.7525 -0.582697 80.6288 -0.691718C107.505 -0.800739 134.381 -0.90976 161.258 -1.01878C188.134 -1.1278 215.01 -1.23682 241.886 -1.34584C268.763 -1.45486 295.639 -1.56389 322.515 -1.67291C349.391 -1.78193 376.268 -1.89095 389.706 -1.94546L403.144 -1.99997L403.22 16.8494Z"
            fill={isDark ? colors.primaryDark : '#294E9F'}
          />
        </Svg>
      </Animated.View>

      <Animated.Image
        source={require('./assets/Vector2.png')}
        style={[
          styles.bottomWave,
          { opacity: wavesEntrance, transform: [{ translateY: bottomWaveSlide }] },
        ]}
      />

      <View style={styles.container}>
        <Animated.Image
          accessibilityLabel="Logo Side Quest Trieste"
          resizeMode="contain"
          source={require('./assets/logo.png')}
          style={[
            styles.logo,
            {
              opacity: logoEntrance,
              transform: [
                { translateY: logoLift },
                { translateY: logoFloat },
                { scale: logoScale },
              ],
            },
          ]}
        />
        <Animated.View
          style={{
            opacity: buttonEntrance,
            transform: [{ translateY: buttonLift }],
          }}
        >
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('Login')}
            style={({ pressed }) => [
              styles.welcomeButton,
              { backgroundColor: isDark ? colors.card : '#294E9F' },
              pressed && styles.welcomeButtonPressed,
            ]}
          >
            <Text style={[styles.welcomeText, isDark && { color: colors.accent }]}>{t('welcomeStart')}</Text>
          </Pressable>
        </Animated.View>
      </View>

      <StatusBar style="light" />
    </View>
  );
}

function ProtectedMain(props: NativeStackScreenProps<RootStackParamList, 'Main'>) {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      props.navigation.replace('Login');
    }
  }, [isAuthenticated, props.navigation]);

  if (!isAuthenticated) {
    return null;
  }

  return <MainTabs />;
}

function AppNavigation() {
  const { colors, isDark, t } = useAppTheme();
  const baseNavigationTheme = isDark ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...baseNavigationTheme,
    colors: {
      ...baseNavigationTheme.colors,
      background: colors.background,
      border: colors.border,
      card: colors.card,
      notification: colors.accent,
      primary: colors.primary,
      text: colors.text,
    },
  };

  return (
    <NavigationContainer linking={linking} theme={navigationTheme}>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          component={Home}
          name="Home"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          component={Login}
          name="Login"
          options={({ navigation }) => ({
            animation: 'slide_from_right',
            headerLeft: () => (
              <Pressable
                accessibilityLabel={t('back')}
                accessibilityRole="button"
                hitSlop={10}
                onPress={() => navigation.goBack()}
              >
                <BackIcon width={38} height={38} />
              </Pressable>
            ),
            headerShadowVisible: false,
            headerTintColor: '#fff',
            headerTitle: '',
            headerTransparent: true,
          })}
        />
        <Stack.Screen
          component={RecoverCredentials}
          name="RecoverCredentials"
          options={{
            animation: 'slide_from_right',
            headerShown: false,
          }}
        />
        <Stack.Screen
          component={ProtectedMain}
          name="Main"
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function AppContent() {
  const [showStartup, setShowStartup] = useState(true);

  return (
    <View style={styles.appRoot}>
      <AppNavigation />
      {showStartup && <StartupSplash onFinish={() => setShowStartup(false)} />}
    </View>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <EventStoreProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </EventStoreProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  appRoot: {
    flex: 1,
  },
  startupOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 1000,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5372B5',
  },
  startupRing: {
    position: 'absolute',
    width: 236,
    height: 236,
    borderWidth: 3,
    borderColor: '#F5C330',
    borderRadius: 118,
    backgroundColor: 'rgba(245, 195, 48, 0.08)',
  },
  startupLogo: {
    width: 220,
    height: 220,
  },
  screen: {
    flex: 1,
    backgroundColor: '#5372B5',
    overflow: 'hidden',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  logo: {
    width: 220,
    height: 220,
  },
  topWave: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: 93,
  },
  bottomWave: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 161,
    height: 119,
  },
  welcomeButton: {
    marginTop: 20,
    backgroundColor: '#294E9F',
    padding: 10,
    borderRadius: 10,
  },
  welcomeButtonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});

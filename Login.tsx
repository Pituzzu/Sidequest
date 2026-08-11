import { StatusBar } from 'expo-status-bar';
import {
  RubikDirt_400Regular,
  useFonts,
} from '@expo-google-fonts/rubik-dirt';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { RootStackParamList } from './routes';
import { useAppTheme } from './ThemeContext';
import { useAuth } from './AuthContext';

type LoginProps = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function Login({ navigation }: LoginProps) {
  const { colors, isDark, t } = useAppTheme();
  const { signIn } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [fontsLoaded, fontError] = useFonts({ RubikDirt_400Regular });

  if (!fontsLoaded && !fontError) {
    return null;
  }

  const handleLogin = () => {
    Keyboard.dismiss();
    const result = signIn(username, password);

    if (!result.success) {
      setLoginError(result.error);
      return;
    }

    setLoginError(null);
    navigation.replace('Main');
  };

  return (
    <View style={[styles.screen, { backgroundColor: isDark ? colors.background : '#5372B5' }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardArea}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Image
            accessibilityLabel="Logo Side Quest Trieste"
            resizeMode="contain"
            source={require('./assets/logo.png')}
            style={styles.logo}
          />

          <Text style={styles.title}>{t('login')}</Text>

          <View style={styles.form}>
            <TextInput
              accessibilityLabel="Username"
              autoCapitalize="none"
              autoComplete="username"
              autoCorrect={false}
              onChangeText={(value) => {
                setUsername(value);
                if (loginError) setLoginError(null);
              }}
              placeholder="Username"
              placeholderTextColor="#7180A0"
              returnKeyType="next"
              style={[styles.input, isDark && { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              value={username}
            />

            <TextInput
              accessibilityLabel={t('password')}
              autoCapitalize="none"
              autoComplete="current-password"
              onChangeText={(value) => {
                setPassword(value);
                if (loginError) setLoginError(null);
              }}
              onSubmitEditing={handleLogin}
              placeholder={t('password')}
              placeholderTextColor="#7180A0"
              returnKeyType="done"
              secureTextEntry
              style={[styles.input, isDark && { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              value={password}
            />

            {loginError && (
              <Text accessibilityRole="alert" style={styles.loginError}>
                {t(loginError)}
              </Text>
            )}

            <Pressable
              accessibilityRole="button"
              onPress={handleLogin}
              style={({ pressed }) => [
                styles.loginButton,
                pressed && styles.loginButtonPressed,
              ]}
            >
              <Text style={styles.loginButtonText}>{t('signIn')}</Text>
            </Pressable>

            <Pressable
              accessibilityRole="link"
              hitSlop={8}
              onPress={() => navigation.navigate('RecoverCredentials')}
            >
              <Text style={styles.forgotCredentials}>
                {t('forgotCredentials')}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View pointerEvents="none" style={styles.bottomWave}>
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
      </View>

      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#5372B5',
    overflow: 'hidden',
  },
  keyboardArea: {
    flex: 1,
    zIndex: 1,
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingTop: 80,
    paddingBottom: 130,
  },
  logo: {
    width: 180,
    height: 180,
  },
  title: {
    marginBottom: 24,
    color: '#fff',
    fontFamily: 'RubikDirt_400Regular',
    fontSize: 38,
    textAlign: 'center',
    textTransform: 'uppercase',
    marginTop: 20,
  },
  form: {
    width: '100%',
    maxWidth: 340,
    gap: 14,
  },
  input: {
    width: '100%',
    height: 52,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#D5DDEC',
    borderRadius: 10,
    backgroundColor: '#fff',
    color: '#17213A',
    fontSize: 16,
  },
  loginButton: {
    width: '100%',
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    borderRadius: 10,
    backgroundColor: '#294E9F',
  },
  loginError: {
    marginTop: -4,
    color: '#FFE0DF',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  loginButtonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  forgotCredentials: {
    alignSelf: 'center',
    color: '#fff',
    fontSize: 15,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  bottomWave: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: 93,
    transform: [{ scaleY: -1 }],
  },
});

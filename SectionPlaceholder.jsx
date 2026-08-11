import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppHeader from './AppHeader';
import { useAppTheme } from './ThemeContext';

export default function SectionPlaceholder({ navigation, title }) {
  const { colors, isDark } = useAppTheme();
  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: colors.background }]}>
      <AppHeader onBack={() => navigation.navigate('Home')} />
      <View style={styles.content}>
        <Text style={[styles.title, isDark && { color: colors.text }]}>{title}</Text>
      </View>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#DEDEDE',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#283F70',
    fontFamily: 'RubikDirt_400Regular',
    fontSize: 30,
  },
});

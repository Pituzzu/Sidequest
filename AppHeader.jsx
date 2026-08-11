import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from './ThemeContext';
import BackIcon from './assets/back.svg';

export default function AppHeader({ onBack }) {
  const { colors, isDark, t } = useAppTheme();

  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel={t('back')}
        accessibilityRole="button"
        hitSlop={10}
        onPress={onBack}
        style={({ pressed }) => [
          styles.backButton,
          pressed && styles.backButtonPressed,
        ]}
      >
        <View style={[styles.backIcon, isDark && { backgroundColor: colors.accent }]}> 
          <BackIcon width={36} height={36} />
        </View>
        <Text style={[styles.backLabel, { color: isDark ? colors.text : '#4B4B4B' }]}>{t('back')}</Text>
      </Pressable>

      <Image
        accessibilityLabel="Logo Side Quest Trieste"
        resizeMode="contain"
        source={require('./assets/logo.png')}
        style={styles.logo}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    minHeight: 86,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 2,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  backButtonPressed: {
    opacity: 0.65,
    transform: [{ scale: 0.98 }],
  },
  backIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: 'transparent',
  },
  backLabel: {
    color: '#4B4B4B',
    fontSize: 14,
    fontWeight: '700',
  },
  logo: {
    width: 74,
    height: 74,
  },
});

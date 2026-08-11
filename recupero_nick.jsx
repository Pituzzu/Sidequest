import {
  RubikDirt_400Regular,
  useFonts,
} from '@expo-google-fonts/rubik-dirt';
import { StatusBar } from 'expo-status-bar';
import {
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useAppTheme } from './ThemeContext';

const WHATSAPP_NUMBER = '393467460419';

async function contactSupport(message, t) {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert(
      t('whatsappError'),
      t('whatsappErrorBody'),
    );
  }
}

function WhatsAppIcon() {
  return (
    <Svg width={34} height={34} viewBox="0 0 34 34" fill="none">
      <Path
        clipRule="evenodd"
        d="M27.5407 6.44805C26.1654 5.07215 24.5316 3.98186 22.7333 3.23993C20.935 2.498 19.0078 2.11908 17.0624 2.125C8.89844 2.125 2.2525 8.73773 2.24918 16.8672C2.24557 19.4558 2.92791 21.9991 4.22676 24.2383L2.125 31.875L9.97754 29.825C12.1512 31.0026 14.5844 31.6189 17.0564 31.618H17.0624C25.2257 31.618 31.871 25.0046 31.875 16.8758C31.8799 14.9371 31.4993 13.0168 30.7552 11.2266C30.0111 9.43639 28.9184 7.81203 27.5407 6.44805ZM17.0624 29.1298H17.0571C14.8533 29.1304 12.6896 28.5406 10.791 27.4218L10.3414 27.1562L5.68172 28.3727L6.92551 23.8511L6.63266 23.3863C5.40041 21.4354 4.74755 19.1747 4.75004 16.8672C4.75004 10.1117 10.2757 4.61523 17.0671 4.61523C20.325 4.60942 23.4517 5.89789 25.7597 8.19727C28.0677 10.4966 29.3678 13.6186 29.3741 16.8765C29.3715 23.6327 23.8485 29.1298 17.0624 29.1298ZM23.8153 19.9531C23.4454 19.7685 21.6239 18.8773 21.2865 18.7545C20.9492 18.6316 20.7002 18.5698 20.4538 18.9391C20.2074 19.3083 19.4975 20.1344 19.2817 20.3834C19.0659 20.6324 18.8501 20.6596 18.4802 20.475C18.1103 20.2904 16.917 19.902 15.5032 18.6469C14.4029 17.67 13.6604 16.4641 13.4446 16.0955C13.2288 15.727 13.4214 15.5271 13.6066 15.3438C13.7733 15.1785 13.9765 14.9135 14.1618 14.6984C14.3471 14.4832 14.4088 14.3291 14.5317 14.0834C14.6545 13.8377 14.5934 13.6226 14.5011 13.4386C14.4088 13.2547 13.6684 11.4411 13.3603 10.7034C13.0595 9.98484 12.7546 10.0825 12.5275 10.0712C12.3117 10.0605 12.0627 10.0579 11.8177 10.0579C11.6303 10.0628 11.446 10.1062 11.2762 10.1855C11.1065 10.2648 10.9548 10.3782 10.8309 10.5187C10.4915 10.888 9.53527 11.7805 9.53527 13.592C9.53527 15.4036 10.8634 17.1567 11.0467 17.4024C11.23 17.6481 13.6564 21.3689 17.3692 22.9646C18.0586 23.2599 18.7631 23.5188 19.4796 23.7402C20.3661 24.0205 21.173 23.9813 21.8105 23.8863C22.5217 23.7807 24.0019 22.9952 24.3093 22.1345C24.6168 21.2739 24.6175 20.5368 24.5252 20.3834C24.4329 20.23 24.1858 20.137 23.8153 19.9531Z"
        fill="white"
        fillRule="evenodd"
      />
    </Svg>
  );
}

export default function RecoverCredentials({ navigation }) {
  const { colors, isDark, t } = useAppTheme();
  const [fontsLoaded, fontError] = useFonts({ RubikDirt_400Regular });

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <View style={[styles.screen, { backgroundColor: isDark ? colors.background : '#5372B5' }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Image
          accessibilityLabel="Logo Side Quest Trieste"
          resizeMode="contain"
          source={require('./assets/logo.png')}
          style={styles.logo}
        />

        <Text style={styles.title}>{t('recoverCredentials')}</Text>

        <View accessibilityRole="text" style={[styles.messageBox, isDark && { backgroundColor: colors.card }]}>
          <Text style={[styles.message, isDark && { color: colors.text }]}>{t('supportMessage')}</Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={() => contactSupport(t('supportMessage'), t)}
            style={({ pressed }) => [
              styles.button,
              styles.contactButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <View pointerEvents="none" style={styles.buttonIcon}>
              <WhatsAppIcon />
            </View>
            <Text style={styles.buttonText}>{t('contact')}</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [
              styles.button,
              styles.cancelButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Image
              pointerEvents="none"
              resizeMode="contain"
              source={require('./assets/back_red.png')}
              style={styles.buttonIconImage}
            />
            <Text style={styles.buttonText}>{t('cancel')}</Text>
          </Pressable>
        </View>
      </ScrollView>

      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#5372B5',
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 48,
  },
  logo: {
    width: 170,
    height: 170,
  },
  title: {
    width: '100%',
    maxWidth: 340,
    marginTop: 14,
    marginBottom: 24,
    color: '#fff',
    fontFamily: 'RubikDirt_400Regular',
    fontSize: 32,
    lineHeight: 39,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  messageBox: {
    width: '100%',
    maxWidth: 340,
    minHeight: 145,
    justifyContent: 'center',
    padding: 18,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  message: {
    color: '#17213A',
    fontSize: 16,
    lineHeight: 23,
  },
  actions: {
    width: '100%',
    maxWidth: 340,
    marginTop: 18,
    gap: 12,
  },
  button: {
    position: 'relative',
    width: '100%',
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  contactButton: {
    backgroundColor: '#4AB575',
  },
  cancelButton: {
    backgroundColor: '#C46E6B',
  },
  buttonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
  },
  buttonIcon: {
    position: 'absolute',
    left: 14,
  },
  buttonIconImage: {
    position: 'absolute',
    left: 16,
    width: 30,
    height: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});

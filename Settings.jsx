import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppHeader from './AppHeader';
import { useAuth } from './AuthContext';
import { useAppTheme } from './ThemeContext';
import BugsIcon from './assets/beatles.svg';
import KeyIcon from './assets/chiave.svg';
import LanguageIcon from './assets/lingua.svg';
import LogoutIcon from './assets/logout.svg';
import MoonIcon from './assets/luna.svg';
import TicketIcon from './assets/ticket.svg';

function AdminAvatar({ dark }) {
  return (
    <View style={[styles.adminAvatar, dark && styles.adminAvatarDark]}>
      <View style={[styles.adminAvatarHead, dark && styles.adminAvatarShapeDark]} />
      <View style={[styles.adminAvatarBody, dark && styles.adminAvatarShapeDark]} />
    </View>
  );
}

function ThemeSwitch({ active, label, onPress }) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="switch"
      accessibilityState={{ checked: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.themeSwitch,
        active && styles.themeSwitchActive,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.themeSwitchThumb, active && styles.themeSwitchThumbActive]}>
        <Text style={styles.themeSwitchGlyph}>{active ? '☾' : '☀'}</Text>
      </View>
    </Pressable>
  );
}

function LanguageSwitch({ dark, language, onToggle }) {
  const position = useRef(new Animated.Value(language === 'it' ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(position, {
      duration: 280,
      toValue: language === 'it' ? 1 : 0,
      useNativeDriver: true,
    }).start();
  }, [language, position]);

  const translateX = position.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 37],
  });

  return (
    <Pressable
      accessibilityLabel={language === 'it' ? 'Italiano, passa a English' : 'English, switch to Italian'}
      accessibilityRole="switch"
      accessibilityState={{ checked: language === 'en' }}
      onPress={onToggle}
      style={({ pressed }) => [
        styles.languageSwitch,
        dark && styles.languageSwitchDark,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.languageTrackText, styles.languageTrackTextLeft]}>EN</Text>
      <Text style={[styles.languageTrackText, styles.languageTrackTextRight]}>IT</Text>
      <Animated.View style={[styles.languageSwitchThumb, { transform: [{ translateX }] }]}>
        <Text style={styles.languageSwitchThumbText}>{language.toUpperCase()}</Text>
      </Animated.View>
    </Pressable>
  );
}

function SettingsRow({ Icon, dark, label, onPress, right }) {
  const content = (
    <>
      <View style={[styles.settingIconCircle, dark && styles.settingIconCircleDark]}>
        <Icon width={29} height={29} />
      </View>
      <Text style={[styles.settingLabel, dark && styles.settingLabelDark]}>{label}</Text>
      <View style={styles.settingRight}>
        {right ?? <Text style={[styles.settingArrow, dark && styles.settingArrowDark]}>›</Text>}
      </View>
    </>
  );

  if (!onPress) {
    return <View style={styles.settingRow}>{content}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.settingRow, pressed && styles.rowPressed]}
    >
      {content}
    </Pressable>
  );
}

function PanelTitle({ Icon, title, colors, dark }) {
  return (
    <View style={styles.panelTitleRow}>
      <View style={[styles.panelTitleIcon, dark && styles.panelTitleIconDark]}>
        <Icon width={31} height={31} />
      </View>
      <Text style={[styles.panelTitle, { color: dark ? colors.text : '#3159AD' }]}>{title}</Text>
    </View>
  );
}

function PrimaryAction({ disabled, label, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryAction,
        disabled && styles.primaryActionDisabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={styles.primaryActionText}>{label}</Text>
    </Pressable>
  );
}

function TicketSettings({ colors, dark, t }) {
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const canSend = message.trim().length > 0;

  const sendTicket = () => {
    if (!canSend) return;
    setMessage('');
    setSent(true);
  };

  return (
    <View style={styles.ticketPage}>
      <View style={[styles.subpageCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <PanelTitle Icon={TicketIcon} title={t('ticket')} colors={colors} dark={dark} />

        <Text style={[styles.subpageIntro, { color: colors.muted }]}>
          {t('ticketBody')}
        </Text>

        <View style={[styles.ticketInputBox, { backgroundColor: colors.cardAlt }]}>
          <TextInput
            accessibilityLabel={t('ticketPlaceholder')}
            maxLength={150}
            multiline
            onChangeText={(value) => {
              setMessage(value);
              if (sent) setSent(false);
            }}
            placeholder={t('ticketPlaceholder')}
            placeholderTextColor={dark ? '#8491A5' : '#B1B1B1'}
            style={[styles.ticketInput, { color: colors.text }]}
            textAlignVertical="top"
            value={message}
          />
          <Text style={[styles.ticketCounter, { color: colors.muted }]}>{message.length}/150</Text>
        </View>
      </View>

      <PrimaryAction disabled={!canSend} label={t('send')} onPress={sendTicket} />
      {sent && <Text style={styles.successMessage}>{t('ticketSent')}</Text>}
    </View>
  );
}

const PASSWORD_USERS = [
  { id: '12345678', name: 'Nome Cognome' },
  { id: '24581367', name: 'Nome Cognome' },
  { id: '87654321', name: 'Nome Cognome' },
];

function UserAvatar({ dark }) {
  return (
    <View style={[styles.userAvatar, dark && styles.userAvatarDark]}>
      <View style={[styles.userAvatarHead, dark && styles.userAvatarShapeDark]} />
      <View style={[styles.userAvatarBody, dark && styles.userAvatarShapeDark]} />
    </View>
  );
}

function PasswordSettings({ colors, dark, t }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const canSave = Boolean(selectedUser && password.trim().length >= 4 && confirmed);

  const selectUser = (userId) => {
    setSelectedUser((current) => (current === userId ? null : userId));
    setPassword('');
    setConfirmed(false);
  };

  const savePassword = () => {
    if (!canSave) return;
    setSelectedUser(null);
    setPassword('');
    setConfirmed(false);
  };

  return (
    <View style={[styles.subpageCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <PanelTitle Icon={KeyIcon} title={t('passwordChange')} colors={colors} dark={dark} />
      <Text style={[styles.passwordIntro, { color: colors.muted }]}>
        {t('passwordIntro')}
      </Text>

      <ScrollView
        contentContainerStyle={styles.passwordUsers}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={styles.passwordList}
      >
        {PASSWORD_USERS.map((user) => {
          const selected = selectedUser === user.id;
          return (
            <View
              key={user.id}
              style={[
                styles.passwordUserCard,
                { backgroundColor: colors.cardAlt, borderColor: selected ? colors.accent : 'transparent' },
              ]}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => selectUser(user.id)}
                style={({ pressed }) => [styles.passwordUserMain, pressed && styles.rowPressed]}
              >
                <UserAvatar dark={dark} />
                <View style={styles.passwordUserCopy}>
                  <Text style={[styles.passwordUserName, { color: dark ? colors.text : '#3159AD' }]}>
                    {user.name}
                  </Text>
                  <Text style={[styles.passwordUserId, { color: colors.muted }]}>ID: {user.id}</Text>
                </View>
              </Pressable>

              {selected && (
                <View style={styles.passwordEditor}>
                  <TextInput
                    accessibilityLabel={t('insertNewPassword')}
                    onChangeText={(value) => {
                      setPassword(value);
                      setConfirmed(false);
                    }}
                    placeholder={t('insertNewPassword')}
                    placeholderTextColor={dark ? '#8390A3' : '#C4C4C4'}
                    secureTextEntry
                    style={[
                      styles.passwordInput,
                      { backgroundColor: colors.card, color: colors.text, borderColor: colors.border },
                    ]}
                    value={password}
                  />
                  <Pressable
                    accessibilityRole="button"
                    disabled={password.trim().length < 4}
                    onPress={() => setConfirmed((current) => !current)}
                    style={({ pressed }) => pressed && styles.pressed}
                  >
                    <Text
                      style={[
                        styles.confirmPassword,
                        { color: confirmed ? '#4AB575' : dark ? colors.accent : '#3159AD' },
                        password.trim().length < 4 && styles.confirmPasswordDisabled,
                      ]}
                    >
                      {confirmed ? t('confirmedPassword') : t('confirmPassword')}
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      <PrimaryAction disabled={!canSave} label={t('save')} onPress={savePassword} />
    </View>
  );
}

function BugsSettings({ colors, dark, t }) {
  const [report, setReport] = useState('');
  const [sent, setSent] = useState(false);
  const canSend = report.trim().length > 0;

  return (
    <View style={[styles.subpageCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <PanelTitle Icon={BugsIcon} title={t('reportBugsTitle')} colors={colors} dark={dark} />
      <Text style={[styles.bugsIntro, { color: colors.muted }]}>{t('bugsBody')}</Text>

      <View style={[styles.bugsInputBox, { backgroundColor: colors.cardAlt }]}>
        <TextInput
          accessibilityLabel={t('bugsPlaceholder')}
          maxLength={500}
          multiline
          onChangeText={(value) => {
            setReport(value);
            if (sent) setSent(false);
          }}
          placeholder={t('bugsPlaceholder')}
          placeholderTextColor={dark ? '#8491A5' : '#B1B1B1'}
          style={[styles.bugsInput, { color: colors.text }]}
          textAlignVertical="top"
          value={report}
        />
      </View>

      <PrimaryAction
        disabled={!canSend}
        label={t('report')}
        onPress={() => {
          if (!canSend) return;
          setReport('');
          setSent(true);
        }}
      />
      {sent && <Text style={styles.successMessage}>{t('reportSent')}</Text>}
    </View>
  );
}

export default function Settings({ navigation }) {
  const { colors, isDark, language, setLanguage, t, toggleTheme } = useAppTheme();
  const { profile, signOut } = useAuth();
  const [mode, setMode] = useState('main');

  const goBack = () => {
    if (mode !== 'main') {
      setMode('main');
      return;
    }
    const parentNavigation = navigation.getParent();
    if (parentNavigation?.canGoBack()) {
      parentNavigation.goBack();
    }
  };

  const logout = () => {
    signOut();
    navigation.getParent()?.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.pageFrame}>
        <View style={styles.pageContent}>
          <AppHeader onBack={goBack} />

          {mode === 'ticket' && <TicketSettings colors={colors} dark={isDark} t={t} />}
          {mode === 'password' && <PasswordSettings colors={colors} dark={isDark} t={t} />}
          {mode === 'bugs' && <BugsSettings colors={colors} dark={isDark} t={t} />}
          {mode === 'main' && <View style={[styles.settingsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.adminHeader}>
              <AdminAvatar dark={isDark} />
              <View style={styles.profileCopy}>
                <Text
                  numberOfLines={1}
                  style={[styles.adminName, { color: isDark ? colors.text : '#3159AD' }]}
                >
                  {profile?.displayName ?? t('standardUser')}
                </Text>
                <View style={styles.profileMetaRow}>
                  <Text style={[styles.profileUsername, { color: colors.muted }]}>@{profile?.username ?? 'utente'}</Text>
                  <View
                    style={[
                      styles.profileRoleBadge,
                      profile?.role === 'admin'
                        ? styles.profileRoleBadgeAdmin
                        : styles.profileRoleBadgeUser,
                    ]}
                  >
                    <Text style={styles.profileRoleText}>
                      {t(profile?.role === 'admin' ? 'administrator' : 'standardUser')}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <ScrollView
              contentContainerStyle={styles.settingsRows}
              showsVerticalScrollIndicator={false}
            >
              <SettingsRow
                Icon={MoonIcon}
                dark={isDark}
                label={t('darkMode')}
                right={
                  <View style={styles.darkModeRight}>
                    <ThemeSwitch active={isDark} label={t('darkMode')} onPress={toggleTheme} />
                    <View style={styles.premiumBadge}>
                      <Text style={styles.premiumCrown}>♛</Text>
                      <Text style={styles.premiumText}>{t('premium')}</Text>
                    </View>
                  </View>
                }
              />
              <SettingsRow
                Icon={LanguageIcon}
                dark={isDark}
                label={t('language')}
                right={
                  <LanguageSwitch
                    dark={isDark}
                    language={language}
                    onToggle={() => setLanguage((current) => (current === 'it' ? 'en' : 'it'))}
                  />
                }
              />
              <SettingsRow Icon={TicketIcon} dark={isDark} label={t('openTicket')} onPress={() => setMode('ticket')} />
              <SettingsRow Icon={KeyIcon} dark={isDark} label={t('changePassword')} onPress={() => setMode('password')} />
              <SettingsRow Icon={BugsIcon} dark={isDark} label={t('reportBugs')} onPress={() => setMode('bugs')} />
            </ScrollView>

            <Pressable
              accessibilityRole="button"
              onPress={logout}
              style={({ pressed }) => [styles.logoutRow, pressed && styles.rowPressed]}
            >
              <View style={[styles.logoutIconWrap, isDark && styles.logoutIconWrapDark]}>
                <LogoutIcon width={42} height={42} />
              </View>
              <Text style={[styles.logoutLabel, darkText(isDark)]}>{t('logout')}</Text>
            </Pressable>

            <Text style={[styles.versionText, darkText(isDark)]}>{t('version')}</Text>
          </View>}
        </View>
      </View>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </SafeAreaView>
  );
}

function darkText(isDark) {
  return { color: isDark ? '#DDE5F2' : '#747474' };
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  pageFrame: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: 12,
  },
  pageContent: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
  },
  settingsCard: {
    flex: 1,
    width: '90%',
    alignSelf: 'center',
    overflow: 'hidden',
    paddingHorizontal: 21,
    paddingTop: 20,
    paddingBottom: 12,
    borderWidth: 1,
    borderRadius: 23,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.13,
    shadowRadius: 9,
    elevation: 5,
  },
  subpageCard: {
    flex: 1,
    width: '86%',
    alignSelf: 'center',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 18,
    borderWidth: 1,
    borderRadius: 23,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.13,
    shadowRadius: 9,
    elevation: 5,
  },
  ticketPage: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    paddingBottom: 12,
  },
  panelTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    marginBottom: 18,
  },
  panelTitleIcon: {
    width: 37,
    height: 37,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelTitleIconDark: {
    borderRadius: 12,
    backgroundColor: '#F5C330',
  },
  panelTitle: {
    fontSize: 22,
    fontWeight: '900',
  },
  subpageIntro: {
    maxWidth: 270,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
    textAlign: 'center',
  },
  ticketInputBox: {
    width: '100%',
    height: 132,
    marginTop: 29,
    overflow: 'hidden',
    borderRadius: 19,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 4 },
    shadowOpacity: 0.19,
    shadowRadius: 4,
    elevation: 4,
  },
  ticketInput: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 29,
    borderWidth: 0,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 19,
    outlineStyle: 'none',
  },
  ticketCounter: {
    position: 'absolute',
    right: 14,
    bottom: 10,
    fontSize: 14,
    fontWeight: '900',
  },
  primaryAction: {
    minWidth: 112,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 23,
    paddingHorizontal: 25,
    borderRadius: 18,
    backgroundColor: '#3159AD',
  },
  primaryActionDisabled: {
    opacity: 0.48,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  successMessage: {
    marginTop: 9,
    color: '#4AB575',
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'center',
  },
  passwordIntro: {
    marginBottom: 17,
    color: '#747474',
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 19,
    textAlign: 'center',
  },
  passwordList: {
    width: '100%',
    flexGrow: 0,
    flexShrink: 1,
  },
  passwordUsers: {
    gap: 14,
    paddingHorizontal: 2,
    paddingBottom: 5,
  },
  passwordUserCard: {
    width: '100%',
    overflow: 'hidden',
    borderWidth: 2,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 4,
  },
  passwordUserMain: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  userAvatar: {
    width: 43,
    height: 43,
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#050505',
    borderRadius: 22,
  },
  userAvatarDark: {
    borderColor: '#F5C330',
  },
  userAvatarHead: {
    width: 12,
    height: 12,
    marginTop: 6,
    borderRadius: 6,
    backgroundColor: '#050505',
  },
  userAvatarBody: {
    width: 30,
    height: 18,
    marginTop: 4,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    backgroundColor: '#050505',
  },
  userAvatarShapeDark: {
    backgroundColor: '#F5C330',
  },
  passwordUserCopy: {
    flex: 1,
    marginLeft: 14,
  },
  passwordUserName: {
    fontSize: 14,
    fontWeight: '900',
  },
  passwordUserId: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: '800',
  },
  passwordEditor: {
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingBottom: 14,
  },
  passwordInput: {
    width: '100%',
    height: 34,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderRadius: 17,
    fontSize: 11,
    outlineStyle: 'none',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.13,
    shadowRadius: 3,
    elevation: 2,
  },
  confirmPassword: {
    marginTop: 11,
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  confirmPasswordDisabled: {
    opacity: 0.45,
  },
  bugsIntro: {
    maxWidth: 285,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
    textAlign: 'center',
  },
  bugsInputBox: {
    width: '100%',
    height: 136,
    marginTop: 28,
    overflow: 'hidden',
    borderRadius: 19,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 4 },
    shadowOpacity: 0.19,
    shadowRadius: 4,
    elevation: 4,
  },
  bugsInput: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderWidth: 0,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
    outlineStyle: 'none',
  },
  adminHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginBottom: 26,
  },
  adminAvatar: {
    width: 47,
    height: 47,
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#050505',
    borderRadius: 24,
  },
  adminAvatarDark: {
    borderColor: '#F5C330',
  },
  adminAvatarHead: {
    width: 13,
    height: 13,
    marginTop: 7,
    borderRadius: 7,
    backgroundColor: '#050505',
  },
  adminAvatarBody: {
    width: 33,
    height: 19,
    marginTop: 4,
    borderTopLeftRadius: 17,
    borderTopRightRadius: 17,
    backgroundColor: '#050505',
  },
  adminAvatarShapeDark: {
    backgroundColor: '#F5C330',
  },
  adminName: {
    maxWidth: '100%',
    fontSize: 22,
    fontWeight: '900',
  },
  profileCopy: {
    flex: 1,
    minWidth: 0,
    gap: 5,
  },
  profileMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileUsername: {
    flexShrink: 1,
    fontSize: 12,
    fontWeight: '700',
  },
  profileRoleBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  profileRoleBadgeAdmin: {
    backgroundColor: '#F5C330',
  },
  profileRoleBadgeUser: {
    backgroundColor: '#5379C4',
  },
  profileRoleText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '900',
  },
  settingsRows: {
    gap: 15,
    paddingBottom: 18,
  },
  settingRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },
  settingIconCircle: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
    backgroundColor: '#E3E3E3',
  },
  settingIconCircleDark: {
    backgroundColor: '#F5C330',
  },
  settingLabel: {
    flex: 1,
    color: '#747474',
    fontSize: 16,
    fontWeight: '900',
  },
  settingLabelDark: {
    color: '#DDE5F2',
  },
  settingRight: {
    minWidth: 58,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  settingArrow: {
    color: '#747474',
    fontSize: 34,
    fontWeight: '700',
  },
  settingArrowDark: {
    color: '#F5C330',
  },
  darkModeRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  themeSwitch: {
    width: 47,
    height: 27,
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderRadius: 14,
    backgroundColor: '#D1D1D1',
  },
  themeSwitchActive: {
    backgroundColor: '#3159AD',
  },
  themeSwitchThumb: {
    width: 21,
    height: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    backgroundColor: '#fff',
  },
  themeSwitchThumbActive: {
    alignSelf: 'flex-end',
    backgroundColor: '#F5C330',
  },
  themeSwitchGlyph: {
    color: '#283F70',
    fontSize: 13,
    fontWeight: '900',
  },
  premiumBadge: {
    alignItems: 'center',
  },
  premiumCrown: {
    color: '#F2AA00',
    fontSize: 25,
    lineHeight: 25,
  },
  premiumText: {
    color: '#C9852B',
    fontSize: 8,
    fontWeight: '900',
  },
  languagePill: {
    minWidth: 51,
    height: 27,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 7,
    borderRadius: 14,
    backgroundColor: '#D6D0D1',
  },
  languagePillDark: {
    backgroundColor: '#2B3A53',
  },
  languagePillText: {
    minWidth: 28,
    paddingVertical: 4,
    borderRadius: 13,
    backgroundColor: '#3159AD',
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center',
  },
  languageSwitch: {
    position: 'relative',
    width: 74,
    height: 30,
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderRadius: 15,
    backgroundColor: '#D6D0D1',
  },
  languageSwitchDark: {
    backgroundColor: '#30415D',
  },
  languageTrackText: {
    position: 'absolute',
    color: '#8290A1',
    fontSize: 9,
    fontWeight: '900',
  },
  languageTrackTextLeft: {
    left: 12,
  },
  languageTrackTextRight: {
    right: 12,
  },
  languageSwitchThumb: {
    width: 31,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#3159AD',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  languageSwitchThumbText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  logoutRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 'auto',
    paddingLeft: 8,
  },
  logoutIconWrap: {
    width: 45,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutIconWrapDark: {
    borderRadius: 12,
    backgroundColor: '#F5C330',
  },
  logoutLabel: {
    fontSize: 16,
    fontWeight: '900',
  },
  versionText: {
    marginTop: 9,
    fontSize: 14,
    fontStyle: 'italic',
    fontWeight: '800',
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
  rowPressed: {
    opacity: 0.65,
    transform: [{ scale: 0.99 }],
  },
});

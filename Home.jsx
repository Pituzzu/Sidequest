import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppHeader from './AppHeader';
import { useAuth } from './AuthContext';
import EventCalendarIcon from './EventCalendarIcon';
import { useEventStore } from './EventStoreContext';
import { useAppTheme } from './ThemeContext';
import GamesIcon from './assets/games.svg';
import UserBlackIcon from './assets/user_black.svg';
import UsersIcon from './assets/users.svg';

const SURVEYS = [
  {
    id: 'yugioh',
    date: '05 Ago 26',
    time: 'ore 15:30',
    participants: 30,
    timeout: 23 * 60 * 60 + 59 * 60 + 30,
    icon: require('./assets/icone_giochi/yugioh.png'),
  },
  {
    id: 'magic',
    date: '12 Ago 26',
    time: 'ore 18:00',
    participants: 24,
    timeout: 35 * 60 * 60 + 42 * 60 + 18,
    icon: require('./assets/icone_giochi/magic.png'),
  },
  {
    id: 'pokemon',
    date: '19 Ago 26',
    time: 'ore 16:00',
    participants: 18,
    timeout: 52 * 60 * 60 + 15 * 60 + 5,
    icon: require('./assets/icone_giochi/pokemon.png'),
  },
  {
    id: 'onepiece',
    date: '26 Ago 26',
    time: 'ore 20:30',
    participants: 21,
    timeout: 74 * 60 * 60 + 8 * 60 + 44,
    icon: require('./assets/icone_giochi/onepiece.png'),
  },
  {
    id: 'lorcana',
    date: '31 Ago 26',
    time: 'ore 17:00',
    participants: 16,
    timeout: 96 * 60 * 60 + 27 * 60 + 12,
    icon: require('./assets/icone_giochi/lorcana.png'),
  },
];

const USER_EVENTS = [
  {
    dateKey: '2026-08-17',
    day: 17,
    game: 'Yu-Gi-Oh!',
    icon: require('./assets/icone_giochi/yugioh.png'),
    status: 'absent',
    time: '16:00',
    type: 'Ricorrente',
  },
  {
    dateKey: '2026-08-19',
    day: 19,
    game: 'Pokémon',
    icon: require('./assets/icone_giochi/pokemon.png'),
    status: 'present',
    time: '16:00',
    type: 'Ricorrente',
  },
  {
    dateKey: '2026-08-18',
    day: 18,
    game: 'Pokémon',
    icon: require('./assets/icone_giochi/pokemon.png'),
    status: 'waiting',
    time: '16:00',
    type: 'Occasionale',
  },
  {
    dateKey: '2026-08-21',
    day: 21,
    game: 'Magic: The Gathering',
    icon: require('./assets/icone_giochi/magic.png'),
    status: 'present',
    time: '18:00',
    type: 'Ricorrente',
  },
  {
    dateKey: '2026-08-24',
    day: 24,
    game: 'One Piece',
    icon: require('./assets/icone_giochi/onepiece.png'),
    status: 'waiting',
    time: '20:30',
    type: 'Occasionale',
  },
  {
    dateKey: '2026-08-28',
    day: 28,
    game: 'Disney Lorcana',
    icon: require('./assets/icone_giochi/lorcana.png'),
    status: 'absent',
    time: '17:30',
    type: 'Ricorrente',
  },
];

const USER_EVENT_STATUS_COLORS = {
  absent: '#C53834',
  present: '#35BE3E',
  waiting: '#D7A51D',
};

function getSharedHomeEvents(events) {
  return (events ?? []).flatMap((event) =>
    [...event.dateKeys].sort().map((dateKey) => {
      const availableTimes = event.type === 'Occasionale'
        ? event.schedule.timesByDate[dateKey] ?? []
        : event.schedule.times ?? [];
      const confirmedTime = event.confirmedTimesByDate?.[dateKey] ?? null;

      return {
        dateKey,
        game: event.game.name,
        icon: event.game.cardIcon,
        key: `${event.id}-${dateKey}`,
        status: 'waiting',
        time: confirmedTime ?? availableTimes[0] ?? '--:--',
        type: event.type,
      };
    }),
  );
}

function formatUserHomeEventDate(event, language) {
  const [year, month, day] = event.dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const weekday = new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'it-IT', {
    weekday: 'long',
  }).format(date);
  const capitalizedWeekday = `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}`;

  return `${capitalizedWeekday} ${day}, ${language === 'en' ? 'at' : 'ore'} ${event.time}`;
}

function formatCountdown(totalSeconds) {
  const secondsLeft = Math.max(0, totalSeconds);
  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, '0'))
    .join(':');
}

function StatCard({ Icon, dark, label, value }) {
  return (
    <View style={[styles.statCard, dark && styles.statCardDark]}>
      <View style={styles.statIconContainer}>
        <Icon width={27} height={27} />
      </View>
      <View style={styles.statCopy}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );
}

function SurveyCard({ dark, elapsedSeconds, survey, t }) {
  return (
    <View style={[styles.surveyCard, dark && styles.surveyCardDark]}>
      <View style={[styles.surveyDetails, dark && styles.surveyDetailsDark]}>
        <Image
          accessibilityLabel={`Icona sondaggio ${survey.id}`}
          resizeMode="contain"
          source={survey.icon}
          style={styles.surveyIcon}
        />

        <View style={styles.surveyDateBlock}>
          <Text numberOfLines={1} style={[styles.surveyDate, dark && styles.textLight]}>
            {survey.date}
          </Text>
          <Text numberOfLines={1} style={styles.surveyTime}>
            {survey.time}
          </Text>
        </View>

        <View style={styles.timeoutBlock}>
          <Text style={styles.timeoutLabel}>{t('timeout')}</Text>
          <Text numberOfLines={1} style={styles.timeoutValue}>
            {formatCountdown(survey.timeout - elapsedSeconds)}
          </Text>
        </View>
      </View>

      <View style={styles.participantsBlock}>
        <Text style={styles.participantsValue}>{survey.participants}</Text>
        <Text numberOfLines={1} style={styles.participantsLabel}>
          {t('participants')}
        </Text>
      </View>
    </View>
  );
}

function UserCreditCard({ backgroundColor, credits, logo }) {
  return (
    <View style={[styles.userCreditCard, { backgroundColor }]}>
      <View style={styles.userCreditLogoFrame}>
        <Image resizeMode="contain" source={logo} style={styles.userCreditLogo} />
      </View>
      <Text style={styles.userCreditValue}>{credits}</Text>
    </View>
  );
}

function UserHome() {
  const { colors, isDark, language, t } = useAppTheme();
  const { profile } = useAuth();
  const { events } = useEventStore();
  const visibleEvents = useMemo(
    () => [
      ...getSharedHomeEvents(events),
      ...USER_EVENTS.map((event) => ({
        ...event,
        key: `example-${event.game}-${event.dateKey}`,
      })),
    ].sort((first, second) => first.dateKey.localeCompare(second.dateKey)),
    [events],
  );

  return (
    <SafeAreaView
      edges={['top']}
      style={[
        styles.userScreen,
        { backgroundColor: isDark ? colors.background : '#FFF0F1' },
      ]}
    >
      <View style={styles.userHomeContent}>
        <View style={styles.userHomeHeader}>
          <View style={isDark && styles.welcomeIconDark}>
            <UserBlackIcon width={43} height={43} />
          </View>
          <Text
            numberOfLines={1}
            style={[styles.userWelcomeText, isDark && styles.textLight]}
          >
            {t('welcomeProfile')}, {(profile?.username ?? t('standardUser')).toUpperCase()}
          </Text>
          <Image
            accessibilityLabel="Sidequest"
            resizeMode="contain"
            source={require('./assets/logo.png')}
            style={styles.userHeaderLogo}
          />
        </View>

        <View style={styles.userCreditsSection}>
          <UserCreditCard
            backgroundColor="#214F7F"
            credits={profile?.sideQuestCredits ?? 10}
            logo={require('./assets/sidequestcard.png')}
          />
          <UserCreditCard
            backgroundColor="#934D25"
            credits={profile?.gameManiaCredits ?? 10}
            logo={require('./assets/gamemaniacard.png')}
          />
        </View>

        <View style={styles.userEventsSection}>
          <View style={styles.userEventsTitleRow}>
            <Text style={styles.userEventsTitle}>
              {t('eventsAugust2026')}
            </Text>
            <EventCalendarIcon color="#3159AD" height={27} width={27} />
          </View>

          <ScrollView
            contentContainerStyle={styles.userEventsList}
            nestedScrollEnabled
            showsVerticalScrollIndicator
            style={styles.userEventsScroll}
          >
            {visibleEvents.map((event) => (
              <View
                key={event.key}
                style={[
                  styles.userEventCard,
                  isDark && { backgroundColor: colors.cardAlt },
                ]}
              >
                <Image
                  accessibilityLabel={event.game}
                  resizeMode="contain"
                  source={event.icon}
                  style={styles.userEventIcon}
                />
                <View style={styles.userEventCopy}>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.userEventDate,
                      isDark && { color: colors.text },
                    ]}
                  >
                    {formatUserHomeEventDate(event, language)}
                  </Text>
                  <Text
                    style={[
                      styles.userHomeEventType,
                      event.type === 'Occasionale' && styles.userHomeEventTypeOccasional,
                    ]}
                  >
                    {t(event.type === 'Occasionale' ? 'occasional' : 'recurring').toUpperCase()}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.userEventStatus,
                    { color: USER_EVENT_STATUS_COLORS[event.status] },
                  ]}
                >
                  {t(event.status)}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View
          style={[
            styles.userEventsFooter,
            { backgroundColor: isDark ? colors.background : '#FFF0F1' },
          ]}
        >
          <Text style={[styles.userEventsTotal, isDark && styles.textLight]}>
            {t('total')}: {visibleEvents.length}
          </Text>
        </View>
      </View>

      <StatusBar style={isDark ? 'light' : 'dark'} />
    </SafeAreaView>
  );
}

function AdminHome({ navigation }) {
  const { colors, isDark, language, t } = useAppTheme();
  const { profile } = useAuth();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((seconds) => seconds + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.pageFrame}>
        <View style={styles.pageContent}>
          <AppHeader
            onBack={() => {
              const parentNavigation = navigation.getParent();

              if (parentNavigation?.canGoBack()) {
                parentNavigation.goBack();
              }
            }}
          />

          <View style={styles.welcomeGroup}>
            <View style={isDark && styles.welcomeIconDark}>
              <UserBlackIcon width={44} height={44} />
            </View>
            <Text numberOfLines={1} style={[styles.welcomeText, isDark && styles.textLight]}>
              {t('welcomeProfile')}, {(profile?.displayName ?? profile?.username ?? '').toUpperCase()}
            </Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statsRow}>
              <StatCard Icon={UsersIcon} dark={isDark} label={t('users')} value="10" />
              <StatCard Icon={EventCalendarIcon} dark={isDark} label={t('events')} value="10" />
            </View>

            <View style={styles.statsRow}>
              <StatCard Icon={GamesIcon} dark={isDark} label={t('games')} value="10" />
              <StatCard Icon={EventCalendarIcon} dark={isDark} label={t('surveys')} value="5" />
            </View>
          </View>

          <View style={styles.surveysSection}>
            <Text style={[styles.surveysTitle, isDark && styles.textLight]}>{t('monthlySurveys')}</Text>

            <View style={styles.surveysViewport}>
              <ScrollView
                contentContainerStyle={styles.surveysList}
                nestedScrollEnabled
                showsVerticalScrollIndicator
              >
                {SURVEYS.map((survey) => (
                  <SurveyCard
                    dark={isDark}
                    elapsedSeconds={elapsedSeconds}
                    key={survey.id}
                    survey={{
                      ...survey,
                      date: language === 'en' ? survey.date.replace('Ago', 'Aug') : survey.date,
                      time: `${language === 'en' ? 'at' : 'ore'} ${survey.time.split(' ').at(-1)}`,
                    }}
                    t={t}
                  />
                ))}
              </ScrollView>
            </View>
          </View>
        </View>
      </View>

      <StatusBar style={isDark ? 'light' : 'dark'} />
    </SafeAreaView>
  );
}

export default function Home(props) {
  const { isUser } = useAuth();

  return isUser ? <UserHome /> : <AdminHome {...props} />;
}

const styles = StyleSheet.create({
  userScreen: {
    flex: 1,
    backgroundColor: '#FFF0F1',
  },
  userHomeContent: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  userHomeHeader: {
    width: '100%',
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  userWelcomeText: {
    flex: 1,
    color: '#050505',
    fontFamily: 'RubikDirt_400Regular',
    fontSize: 18,
  },
  userHeaderLogo: {
    width: 58,
    height: 58,
    borderRadius: 29,
  },
  userCreditsSection: {
    width: '100%',
    gap: 8,
    marginBottom: 22,
  },
  userCreditCard: {
    width: '100%',
    height: 75,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: 18,
  },
  userCreditLogoFrame: {
    flex: 1,
    height: '100%',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingLeft: 8,
  },
  userCreditLogo: {
    width: '100%',
    height: 59,
  },
  userCreditValue: {
    width: 63,
    color: '#fff',
    fontSize: 31,
    fontWeight: '900',
    textAlign: 'center',
  },
  userEventsSection: {
    flex: 1,
    width: '100%',
    minHeight: 0,
  },
  userEventsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 16,
  },
  userEventsTitle: {
    color: '#5372B5',
    fontSize: 20,
    fontWeight: '900',
  },
  userEventsScroll: {
    flex: 1,
  },
  userEventsList: {
    width: '100%',
    gap: 12,
    paddingBottom: 12,
  },
  userEventCard: {
    width: '100%',
    height: 75,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 15,
    borderRadius: 18,
    backgroundColor: '#DCE7FB',
  },
  userEventIcon: {
    width: 48,
    height: 48,
  },
  userEventCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  userEventDate: {
    color: '#3159AD',
    fontSize: 14,
    fontWeight: '900',
  },
  userHomeEventType: {
    color: '#6582C4',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  userHomeEventTypeOccasional: {
    color: '#C46E6B',
  },
  userEventStatus: {
    minWidth: 58,
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'right',
  },
  userEventsFooter: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 7,
    paddingBottom: 9,
  },
  userEventsTotal: {
    color: '#3159AD',
    fontSize: 20,
    fontWeight: '900',
  },
  screen: {
    flex: 1,
    backgroundColor: '#DEDEDE',
  },
  pageFrame: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 0,
    paddingBottom: 10,
  },
  pageContent: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
  },
  welcomeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 18,
    paddingHorizontal: 12,
  },
  welcomeText: {
    color: '#000',
    fontFamily: 'RubikDirt_400Regular',
    fontSize: 19,
  },
  welcomeIconDark: {
    padding: 3,
    borderRadius: 25,
    backgroundColor: '#F5C330',
  },
  statsGrid: {
    gap: 14,
    marginBottom: 34,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
  },
  statCard: {
    flex: 1,
    minHeight: 57,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderRadius: 18,
    backgroundColor: '#5372B5',
  },
  statCardDark: {
    borderWidth: 1,
    borderColor: '#354866',
    backgroundColor: '#223451',
  },
  statIconContainer: {
    width: '42%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statCopy: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: '#fff',
    fontSize: 23,
    fontWeight: '800',
    lineHeight: 25,
  },
  statLabel: {
    color: '#fff',
    fontSize: 13,
    lineHeight: 17,
  },
  surveysSection: {
    flex: 1,
    width: '100%',
  },
  surveysTitle: {
    marginBottom: 10,
    color: '#283F70',
    fontFamily: 'RubikDirt_400Regular',
    fontSize: 20,
  },
  surveysViewport: {
    flex: 1,
    width: '100%',
    minHeight: 220,
    borderRadius: 19,
    overflow: 'hidden',
  },
  surveysList: {
    gap: 12,
    paddingBottom: 2,
  },
  surveyCard: {
    width: '100%',
    minHeight: 112,
    flexDirection: 'row',
    borderRadius: 19,
    backgroundColor: '#3159AD',
    overflow: 'hidden',
  },
  surveyCardDark: {
    backgroundColor: '#294E9F',
  },
  surveyDetails: {
    zIndex: 1,
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 8,
    paddingRight: 12,
    borderTopRightRadius: 70,
    borderBottomRightRadius: 70,
    backgroundColor: '#fff',
  },
  surveyDetailsDark: {
    backgroundColor: '#18253A',
  },
  textLight: {
    color: '#F4F7FC',
  },
  surveyIcon: {
    width: 48,
    height: 68,
  },
  surveyDateBlock: {
    flex: 1,
    minWidth: 72,
    flexShrink: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  surveyDate: {
    width: '100%',
    color: '#3159A9',
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
    textAlign: 'center',
  },
  surveyTime: {
    width: '100%',
    color: '#6482C7',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  timeoutBlock: {
    minWidth: 68,
    alignItems: 'flex-start',
    marginLeft: 'auto',
  },
  timeoutLabel: {
    color: '#A7352B',
    fontSize: 11,
    fontWeight: '800',
  },
  timeoutValue: {
    color: '#A7352B',
    fontSize: 16,
    fontWeight: '800',
  },
  participantsBlock: {
    width: '27%',
    minWidth: 86,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 7,
    backgroundColor: '#3159AD',
  },
  participantsValue: {
    color: '#fff',
    fontSize: 31,
    fontWeight: '900',
    lineHeight: 34,
  },
  participantsLabel: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },
});

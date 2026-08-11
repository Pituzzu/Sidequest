import {
  RubikDirt_400Regular,
  useFonts,
} from '@expo-google-fonts/rubik-dirt';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Events from './Events';
import EventCalendarIcon from './EventCalendarIcon';
import Games, { INITIAL_ACTIVE_GAMES } from './Games';
import Home from './Home';
import Settings from './Settings';
import Users from './Users';
import { useAppTheme } from './ThemeContext';
import EventsActiveIcon from './assets/events_y.svg';
import GamesIcon from './assets/games.svg';
import GamesActiveIcon from './assets/games_y.svg';
import HomeIcon from './assets/home.svg';
import HomeActiveIcon from './assets/home_y.svg';
import SettingsIcon from './assets/settings.svg';
import SettingsActiveIcon from './assets/settings_y.svg';
import UsersIcon from './assets/users.svg';
import UsersActiveIcon from './assets/users_y.svg';

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Events: { active: EventsActiveIcon, inactive: EventCalendarIcon, labelKey: 'events' },
  Games: { active: GamesActiveIcon, inactive: GamesIcon, labelKey: 'games' },
  Home: { active: HomeActiveIcon, inactive: HomeIcon, labelKey: 'home' },
  Users: { active: UsersActiveIcon, inactive: UsersIcon, labelKey: 'users' },
  Settings: {
    active: SettingsActiveIcon,
    inactive: SettingsIcon,
    labelKey: 'settings',
  },
};

export default function MainTabs() {
  const { colors, isDark, t } = useAppTheme();
  const [activeGames, setActiveGames] = useState(
    () => new Set(INITIAL_ACTIVE_GAMES),
  );
  const [fontsLoaded, fontError] = useFonts({ RubikDirt_400Regular });

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => {
        const icons = TAB_ICONS[route.name];

        return {
          headerShown: false,
          tabBarActiveTintColor: '#F5C330',
          tabBarInactiveTintColor: '#fff',
          tabBarIcon: ({ focused }) => {
            const Icon = focused ? icons.active : icons.inactive;

            return (
              <View style={styles.tabItemContent}>
                <Icon width={27} height={27} />
                <Text
                  style={[
                    styles.tabItemLabel,
                    { color: focused ? colors.accent : isDark ? '#D9E3F3' : '#fff' },
                  ]}
                >
                  {t(icons.labelKey)}
                </Text>
              </View>
            );
          },
          tabBarIconStyle: styles.tabBarIcon,
          tabBarItemStyle: styles.tabBarItem,
          tabBarShowLabel: false,
          tabBarStyle: [styles.tabBar, { backgroundColor: colors.primaryDark }],
        };
      }}
    >
      <Tab.Screen name="Events" options={{ tabBarLabel: t('events') }}>
        {(props) => <Events {...props} activeGameKeys={activeGames} />}
      </Tab.Screen>
      <Tab.Screen
        name="Games"
        options={{ tabBarLabel: t('games') }}
      >
        {(props) => (
          <Games
            {...props}
            activeGames={activeGames}
            onActiveGamesChange={setActiveGames}
          />
        )}
      </Tab.Screen>
      <Tab.Screen
        component={Home}
        name="Home"
        options={{ tabBarLabel: t('home') }}
      />
      <Tab.Screen
        name="Users"
        options={{ tabBarLabel: t('users') }}
      >
        {(props) => <Users {...props} activeGameKeys={activeGames} />}
      </Tab.Screen>
      <Tab.Screen
        component={Settings}
        name="Settings"
        options={{ tabBarLabel: t('settings') }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 70,
    paddingTop: 0,
    paddingBottom: 0,
    borderTopWidth: 0,
    backgroundColor: '#283F70',
    elevation: 0,
    shadowOpacity: 0,
  },
  tabBarItem: {
    height: 70,
    justifyContent: 'center',
    paddingVertical: 0,
  },
  tabBarIcon: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItemContent: {
    minWidth: 52,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  tabItemLabel: {
    fontSize: 9,
    fontWeight: '400',
    lineHeight: 11,
  },
});

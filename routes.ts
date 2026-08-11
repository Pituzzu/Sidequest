import type { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  Events: undefined;
  Games: undefined;
  Home: undefined;
  Users: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  RecoverCredentials: undefined;
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
};

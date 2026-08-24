import type { AsyncStorageStatic } from '@react-native-async-storage/async-storage';
import type { Persistence } from 'firebase/auth';

import 'firebase/auth';

// Firebase 12 exposes this API at runtime for React Native, but its generic
// package typings do not currently include the platform-specific declaration.
declare module 'firebase/auth' {
  export function getReactNativePersistence(
    storage: AsyncStorageStatic,
  ): Persistence;
}

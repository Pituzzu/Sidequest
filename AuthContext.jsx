import { createContext, useContext, useMemo, useState } from 'react';

const ADMIN_CREDENTIALS = {
  password: '1234',
  username: 'admin',
};

const ROLE_PERMISSIONS = {
  admin: {
    manageCredits: true,
    manageEvents: true,
    manageGames: true,
    manageSettings: true,
    manageUsers: true,
    viewSections: true,
  },
  user: {
    manageCredits: false,
    manageEvents: false,
    manageGames: false,
    manageSettings: false,
    manageUsers: false,
    viewSections: true,
  },
};

const AuthContext = createContext({
  can: () => false,
  isAdmin: false,
  isAuthenticated: false,
  isUser: false,
  profile: null,
  signIn: (_username, _password) => ({ error: 'invalidCredentials', success: false }),
  signOut: () => {},
});

function createProfile(username, role) {
  const isAdmin = role === 'admin';

  return {
    displayName: isAdmin ? 'Sidequest Admin' : username,
    gameManiaCredits: isAdmin ? null : 10,
    id: isAdmin ? 'admin-profile' : `user-${username.toLowerCase()}`,
    permissions: ROLE_PERMISSIONS[role],
    role,
    sideQuestCredits: isAdmin ? null : 10,
    username,
  };
}

export function AuthProvider({ children }) {
  const [profile, setProfile] = useState(null);

  const value = useMemo(() => {
    const signIn = (usernameValue, passwordValue) => {
      const username = usernameValue.trim();
      const password = passwordValue.trim();

      if (!username || !password) {
        return { error: 'insertCredentials', success: false };
      }

      const isAdminUsername = username.toLowerCase() === ADMIN_CREDENTIALS.username;
      if (isAdminUsername && password !== ADMIN_CREDENTIALS.password) {
        return { error: 'invalidAdminCredentials', success: false };
      }

      const nextProfile = createProfile(
        isAdminUsername ? ADMIN_CREDENTIALS.username : username,
        isAdminUsername ? 'admin' : 'user',
      );
      setProfile(nextProfile);

      return { profile: nextProfile, success: true };
    };

    return {
      can: (permission) => Boolean(profile?.permissions?.[permission]),
      isAdmin: profile?.role === 'admin',
      isAuthenticated: Boolean(profile),
      isUser: profile?.role === 'user',
      profile,
      signIn,
      signOut: () => setProfile(null),
    };
  }, [profile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

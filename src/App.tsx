import React, { useEffect, useState } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import HomeScreen from './features/booking/HomeScreen';
import LoginScreen from './features/auth/LoginScreen';
import { useAppStore } from './store/useAppStore';

const queryClient = new QueryClient();

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const { token, setToken, setUser, user } = useAppStore();
  const [initializing, setInitializing] = useState(true);

  // Handle user state changes
  useEffect(() => {
    const onAuthStateChanged = (firebaseUser: FirebaseAuthTypes.User | null) => {
      if (firebaseUser) {
        // Sync Firebase state to local store
        if (!user || user.userId !== firebaseUser.uid) {
          setUser({
            userId: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || 'Google User',
            role: 'user',
            permissions: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          setToken(firebaseUser.uid); 
        }
      } else {
        // Only clear if we were using Firebase (token is uid)
        // Manual email login uses a different token format
        if (token && token === user?.userId) {
          setToken(null);
          setUser(null);
        }
      }
      if (initializing) setInitializing(false);
    };

    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, [initializing, setToken, setUser, user, token]);

  if (initializing) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        {token ? <HomeScreen /> : <LoginScreen />}
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

export default App;

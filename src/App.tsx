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
  const { token, setToken, setUser } = useAppStore();
  const [initializing, setInitializing] = useState(true);

  // Handle user state changes
  useEffect(() => {
    const onAuthStateChanged = (firebaseUser: FirebaseAuthTypes.User | null) => {
      if (firebaseUser) {
        // If logged in via Firebase, we can sync to our store
        // We'll use the uid as a placeholder token if needed, 
        // or just rely on the firebase user presence
        setUser({
          userId: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || 'Google User',
          role: 'user',
          permissions: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        // We set a placeholder token so the UI shows HomeScreen
        setToken(firebaseUser.uid); 
      }
      if (initializing) setInitializing(false);
    };

    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, [initializing, setToken, setUser]);

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

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Alert,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useAppStore } from '../../store/useAppStore';
import { useStoreData } from '../../hooks/useStoreData';
import {
  getGreetingMessage,
  getNowInTimezone,
  getTargetTimezone,
} from '../../utils/dateHelpers';
import { isStoreOpenNow, getNextOpeningTime } from '../../utils/availability';
import {
  scheduleOpeningNotification,
  cancelOpeningNotifications,
  triggerDemoNotification,
} from '../../services/notificationService';
import BookingModal from '../../components/BookingModal';

const COLORS = {
  background: '#F2F4F6',
  surface: '#FFFFFF',
  text: '#0B0F14',
  secondaryText: '#6B7280',
  tertiaryText: '#9CA3AF',
  black: '#000000',
  divider: '#E6EAF0',
  green: '#22C55E',
  red: '#EF4444',
};

const RADII = {
  card: 28,
  pill: 999,
};

const SHADOW = {
  shadowColor: COLORS.black,
  shadowOpacity: 0.06,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 8 },
  elevation: 6,
} as const;

const HomeScreen: React.FC = () => {
  const { timezonePreference, toggleTimezone, booking, logout: clearStore } = useAppStore();
  const { data, isLoading, error, refetch } = useStoreData();
  const [isModalVisible, setModalVisible] = useState(false);

  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 900,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [pulse]);

  const handleLogout = async () => {
    try {
      await auth().signOut();
      try {
        await GoogleSignin.signOut();
      } catch {
        // Ignore Google sign out errors if already signed out
      }
      clearStore();
    } catch (err) {
      console.error('Logout error:', err);
      clearStore();
    }
  };

  const greeting = useMemo(
    () => getGreetingMessage(timezonePreference),
    [timezonePreference]
  );

  const upcomingBooking = useMemo(() => {
    if (!booking) return null;
    const targetTz = getTargetTimezone(timezonePreference);
    const utcDate = parseISO(booking.date);
    const zonedDate = toZonedTime(utcDate, targetTz);

    return {
      displayDate: format(zonedDate, 'EEEE, MMMM do, yyyy'),
      displayTime: format(zonedDate, 'HH:mm'),
    };
  }, [booking, timezonePreference]);

  const currentStoreStatus = useMemo(() => {
    if (!data) return { isOpen: false };
    const nowInNYC = getNowInTimezone('America/New_York');
    const isOpen = isStoreOpenNow(nowInNYC, data.times, data.overrides);

    if (!isOpen) {
      const nextOpen = getNextOpeningTime(nowInNYC, data.times, data.overrides);
      if (nextOpen) {
        scheduleOpeningNotification(nextOpen).catch(console.error);
      }
    } else {
      cancelOpeningNotifications().catch(console.error);
    }

    return { isOpen };
  }, [data]);

  const statusDotColor = currentStoreStatus.isOpen ? COLORS.green : COLORS.red;
  const statusPulseColor = currentStoreStatus.isOpen
    ? 'rgba(34, 197, 94, 0.20)'
    : 'rgba(239, 68, 68, 0.20)';

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.black} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Failed to load store data.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.root}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <TouchableOpacity
                activeOpacity={1}
                onLongPress={() => {
                  triggerDemoNotification();
                  Alert.alert(
                    'Cheat Code Activated',
                    'Demo notification scheduled for 10 seconds from now. Background the app to see it!'
                  );
                }}
              >
                <View>
                  <Text style={styles.cityName}>{greeting}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleLogout}
                style={styles.logoutButton}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Log out"
              >
                <View style={styles.logoutIcon}>
                  <View style={styles.logoutArrow} />
                  <View style={styles.logoutBar} />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.grid}>
            <TouchableOpacity
              style={[styles.widgetCard, styles.widgetTimezone]}
              onPress={toggleTimezone}
              activeOpacity={0.7}
            >
              <Text style={styles.widgetLabel}>Time Context</Text>
              <Text style={styles.widgetValue}>
                {timezonePreference === 'America/New_York' ? 'NYC' : 'Local'}
              </Text>
              <Text style={styles.widgetHint}>Tap to toggle</Text>
            </TouchableOpacity>

            <View style={[styles.widgetCard, styles.widgetStatus]}>
              <Text style={styles.widgetLabel}>Store Status</Text>
              <View style={styles.statusLine}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: statusDotColor },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.statusPulse,
                    {
                      backgroundColor: statusPulseColor,
                      transform: [
                        {
                          scale: pulse.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 2.2],
                          }),
                        },
                      ],
                      opacity: pulse.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.9, 0],
                      }),
                    },
                  ]}
                  pointerEvents="none"
                />
                <Text
                  style={[
                    styles.statusText,
                    { color: statusDotColor },
                  ]}
                >
                  {currentStoreStatus.isOpen ? 'Open Now' : 'Closed Now'}
                </Text>
              </View>
              <Text style={styles.widgetHint}>All times in NYC</Text>
            </View>
          </View>

          <View style={styles.heroCard}>
            <View style={styles.heroAccent} />
            <View style={styles.heroContent}>
              <Text style={styles.heroLabel}>Appointment</Text>

              {upcomingBooking ? (
                <>
                  <Text style={styles.heroPrimary}>{upcomingBooking.displayDate}</Text>
                  <Text style={styles.heroSecondary}>at {upcomingBooking.displayTime}</Text>
                </>
              ) : (
                <>
                  <Text style={styles.heroPrimary}>No appointment yet</Text>
                  <Text style={styles.heroSecondary}>Tap Schedule to book your spot</Text>
                </>
              )}

              <View style={styles.heroDecor} pointerEvents="none">
                <View style={styles.heroChip} />
                <View style={[styles.heroChip, styles.heroChip2]} />
              </View>
            </View>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>

        <View style={styles.fabContainer} pointerEvents="box-none">
          <TouchableOpacity
            style={styles.fab}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.fabText}>{booking ? 'Reschedule' : 'Schedule'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {data && (
        <BookingModal
          visible={isModalVisible}
          onClose={() => setModalVisible(false)}
          times={data.times}
          overrides={data.overrides}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  root: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 140,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingBottom: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.divider,
    ...SHADOW,
  },
  logoutIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutArrow: {
    width: 10,
    height: 10,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: COLORS.black,
    transform: [{ rotate: '45deg' }],
    position: 'absolute',
    right: 4,
  },
  logoutBar: {
    width: 14,
    height: 2,
    backgroundColor: COLORS.black,
    position: 'absolute',
    left: 4,
  },
  greetingSmall: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondaryText,
    marginBottom: 4,
  },
  cityName: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.2,
  },
  grid: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 16,
  },
  widgetCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.card,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.divider,
    ...SHADOW,
  },
  widgetTimezone: {
    flex: 1,
    minHeight: 140,
  },
  widgetStatus: {
    flex: 1,
    minHeight: 140,
  },
  widgetLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.tertiaryText,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  widgetValue: {
    marginTop: 12,
    fontSize: 34,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -0.6,
  },
  widgetHint: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.secondaryText,
  },
  statusLine: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  statusPulse: {
    position: 'absolute',
    left: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '800',
  },
  heroCard: {
    marginTop: 16,
    backgroundColor: COLORS.surface,
    borderRadius: RADII.card,
    borderWidth: 1,
    borderColor: COLORS.divider,
    overflow: 'hidden',
    ...SHADOW,
  },
  heroAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 10,
    backgroundColor: COLORS.black,
  },
  heroContent: {
    padding: 20,
    paddingLeft: 26,
    paddingRight: 120,
    minHeight: 160,
    justifyContent: 'center',
  },
  heroLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.tertiaryText,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    marginBottom: 10,
  },
  heroPrimary: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -0.2,
    flexShrink: 1,
  },
  heroSecondary: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.secondaryText,
    flexShrink: 1,
  },
  heroDecor: {
    position: 'absolute',
    right: 14,
    top: 14,
    width: 84,
    height: 84,
  },
  heroChip: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  heroChip2: {
    right: 22,
    top: 28,
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    borderColor: '#E0E7FF',
  },
  bottomSpacer: {
    height: 16,
  },
  fabContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 40,
  },
  fab: {
    backgroundColor: COLORS.black,
    paddingVertical: 16,
    borderRadius: RADII.pill,
    alignItems: 'center',
    ...SHADOW,
    shadowOpacity: 0.18,
  },
  fabText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '600',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: COLORS.black,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;

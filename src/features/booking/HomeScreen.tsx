import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { useAppStore } from '../../store/useAppStore';
import { useStoreData } from '../../hooks/useStoreData';
import {
  getGreetingMessage,
  getNowInTimezone,
  getTargetTimezone,
} from '../../utils/dateHelpers';
import { isStoreOpenNow } from '../../utils/availability';
import TimezoneToggle from '../../components/TimezoneToggle';
import BookingModal from '../../components/BookingModal';

const HomeScreen: React.FC = () => {
  const { timezonePreference, booking, logout } = useAppStore();
  const { data, isLoading, error } = useStoreData();
  const [isModalVisible, setModalVisible] = useState(false);

  const greeting = useMemo(
    () => getGreetingMessage(timezonePreference),
    [timezonePreference]
  );

  const upcomingBooking = useMemo(() => {
    if (!booking) return null;
    const targetTz = getTargetTimezone(timezonePreference);
    
    // The stored date is now a proper UTC ISO string
    const utcDate = parseISO(booking.date);
    
    // Convert UTC to the target timezone for display
    const zonedDate = toZonedTime(utcDate, targetTz);

    return {
      displayDate: format(zonedDate, 'EEEE, MMMM do, yyyy'),
      displayTime: format(zonedDate, 'HH:mm'),
    };
  }, [booking, timezonePreference]);

  const currentStoreStatus = useMemo(() => {
    if (!data) return { isOpen: false };
    // The restaurant's physical status is ALWAYS based on NYC time
    const nowInNYC = getNowInTimezone('America/New_York');
    const isOpen = isStoreOpenNow(nowInNYC, data.times, data.overrides);
    return { isOpen };
  }, [data]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Failed to load store data.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.greeting}>{greeting}</Text>
              <Text style={styles.subtitle}>Welcome to Per Diem Challenge</Text>
            </View>
            <TouchableOpacity onPress={logout} style={styles.logoutButton}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TimezoneToggle />

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Current Status</Text>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusIndicator,
                currentStoreStatus.isOpen ? styles.indicatorOpen : styles.indicatorClosed,
              ]}
            />
            <Text
              style={[
                styles.statusText,
                currentStoreStatus.isOpen ? styles.textOpen : styles.textClosed,
              ]}
            >
              {currentStoreStatus.isOpen ? 'Open Now' : 'Closed Now'}
            </Text>
          </View>
        </View>

        {upcomingBooking && (
          <View style={styles.bookingCard}>
            <Text style={styles.bookingTitle}>Upcoming Appointment</Text>
            <Text style={styles.bookingDate}>
              {upcomingBooking.displayDate}
            </Text>
            <Text style={styles.bookingTime}>at {upcomingBooking.displayTime}</Text>
          </View>
        )}

        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.bookButton}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.bookButtonText}>
              {booking ? 'Reschedule Appointment' : 'Book Appointment'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

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
    backgroundColor: '#F2F2F7',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  logoutButton: {
    padding: 8,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
  },
  logoutText: {
    color: '#FF3B30',
    fontWeight: '600',
    fontSize: 14,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  card: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  indicatorOpen: {
    backgroundColor: '#34C759',
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  indicatorClosed: {
    backgroundColor: '#FF3B30',
  },
  statusText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  textOpen: {
    color: '#34C759',
  },
  textClosed: {
    color: '#FF3B30',
  },
  bookingCard: {
    backgroundColor: '#007AFF',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  bookingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  bookingDate: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  bookingTime: {
    fontSize: 18,
    color: '#FFF',
    marginTop: 4,
  },
  actionContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  bookButton: {
    backgroundColor: '#000',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  bookButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '600',
  },
});

export default HomeScreen;

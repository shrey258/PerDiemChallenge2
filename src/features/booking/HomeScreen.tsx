import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ScrollView,
} from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import { useStoreData } from '../../hooks/useStoreData';
import {
  generateNext30Days,
  getGreetingMessage,
} from '../../utils/dateHelpers';
import { getStoreAvailability } from '../../utils/availability';
import TimezoneToggle from '../../components/TimezoneToggle';
import DateList from '../../components/DateList';
import TimeSlotGrid from '../../components/TimeSlotGrid';

const HomeScreen: React.FC = () => {
  const { timezonePreference } = useAppStore();
  const { data, isLoading, error } = useStoreData();

  const dates = useMemo(
    () => generateNext30Days(timezonePreference),
    [timezonePreference]
  );

  const [selectedDate, setSelectedDate] = useState<Date>(dates[0]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const greeting = useMemo(
    () => getGreetingMessage(timezonePreference),
    [timezonePreference]
  );

  const availability = useMemo(() => {
    if (!data) return { isOpen: false, slots: [], status: 'closed' as const };
    return getStoreAvailability(selectedDate, data.times, data.overrides);
  }, [selectedDate, data]);

  // Reset selected slot when date changes
  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

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
      <ScrollView stickyHeaderIndices={[1]} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.subtitle}>Book your next session</Text>
        </View>

        <View style={styles.stickyToggle}>
          <TimezoneToggle />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <DateList
            dates={dates}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.statusRow}>
            <Text style={styles.sectionTitle}>Available Slots</Text>
          <View style={styles.badgeContainer}>
            <View
              style={[
                styles.statusIndicator,
                availability.isOpen ? styles.indicatorOpen : styles.indicatorClosed,
              ]}
            />
            <Text
              style={[
                styles.statusText,
                availability.isOpen ? styles.textOpen : styles.textClosed,
              ]}
            >
              Store {availability.isOpen ? 'Open' : 'Closed'}
            </Text>
          </View>
          </View>

          {availability.isOpen ? (
            <TimeSlotGrid
              slots={availability.slots}
              selectedSlot={selectedSlot}
              onSelectSlot={setSelectedSlot}
            />
          ) : (
            <View style={styles.closedContainer}>
              <Text style={styles.closedText}>
                The store is closed for the selected date.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 4,
  },
  stickyToggle: {
    backgroundColor: '#F8F9FA',
    paddingBottom: 8,
  },
  section: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginHorizontal: 20,
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 20,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  indicatorOpen: {
    backgroundColor: '#34C759',
  },
  indicatorClosed: {
    backgroundColor: '#FF3B30',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  textOpen: {
    color: '#34C759',
  },
  textClosed: {
    color: '#FF3B30',
  },
  closedContainer: {
    margin: 20,
    padding: 30,
    backgroundColor: '#FFF',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderStyle: 'dashed',
  },
  closedText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '600',
  },
});

export default HomeScreen;

import React, { useMemo, useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';
import { StoreOverride, StoreTime } from '../types/api';
import { useAppStore } from '../store/useAppStore';
import { getStoreAvailability } from '../utils/availability';
import { generateNext30Days, getTargetTimezone } from '../utils/dateHelpers';
import DateList from './DateList';
import TimeSlotGrid from './TimeSlotGrid';

interface BookingModalProps {
  visible: boolean;
  onClose: () => void;
  times: StoreTime[];
  overrides: StoreOverride[];
}

const BookingModal: React.FC<BookingModalProps> = ({
  visible,
  onClose,
  times,
  overrides,
}) => {
  const { timezonePreference, setBooking } = useAppStore();
  
  // Generate dates based on timezone preference
  const dates = useMemo(
    () => generateNext30Days(timezonePreference),
    [timezonePreference]
  );

  const [selectedDate, setSelectedDate] = useState<Date>(dates[0]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const availability = useMemo(() => {
    const targetTz = getTargetTimezone(timezonePreference);
    return getStoreAvailability(selectedDate, times, overrides, targetTz);
  }, [selectedDate, times, overrides, timezonePreference]);

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const [submitting, setSubmitting] = useState(false);

  const handleBooking = async () => {
    if (!selectedSlot) return;

    setSubmitting(true);
    try {
      const targetTz = getTargetTimezone(timezonePreference);
      
      // Combine date and time correctly without string manipulation issues
      const [hours, minutes] = selectedSlot.split(':').map(Number);
      const bookingDateBase = new Date(selectedDate);
      bookingDateBase.setHours(hours, minutes, 0, 0);

      // Convert from the selected timezone back to UTC for storage
      const bookingDateUtc = fromZonedTime(bookingDateBase, targetTz);

      setBooking({
        date: bookingDateUtc.toISOString(),
        slot: selectedSlot,
      });

      // Simulate API delay for demo
      await new Promise<void>((resolve) => setTimeout(resolve, 800));

      onClose();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to save your booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Select Time</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date</Text>
          <DateList
            dates={dates}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
          />
        </View>

        <View style={styles.sectionFlex}>
          <Text style={styles.sectionTitle}>
            Available Slots ({availability.isOpen ? 'Open' : 'Closed'})
          </Text>
          {availability.isOpen ? (
            <TimeSlotGrid
              slots={availability.slots}
              selectedSlot={selectedSlot}
              onSelectSlot={setSelectedSlot}
            />
          ) : (
            <View style={styles.closedContainer}>
              <Text style={styles.closedText}>
                Store is closed on {format(selectedDate, 'MMMM do')}.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.confirmButton,
              (!selectedSlot || submitting) && styles.confirmButtonDisabled,
            ]}
            onPress={handleBooking}
            disabled={!selectedSlot || submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.confirmButtonText}>Confirm Appointment</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F4F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E6EAF0',
    backgroundColor: '#FFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0B0F14',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0B0F14',
  },
  section: {
    marginTop: 16,
  },
  sectionFlex: {
    marginTop: 16,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0B0F14',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  closedContainer: {
    margin: 16,
    padding: 30,
    backgroundColor: '#FFF',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E6EAF0',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  closedText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E6EAF0',
  },
  confirmButton: {
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  confirmButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
});

export default BookingModal;

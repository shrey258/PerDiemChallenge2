import React, { useMemo, useState } from 'react';
import {
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
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

  const handleConfirm = () => {
    if (selectedSlot) {
      const targetTz = getTargetTimezone(timezonePreference);
      const [hours, minutes] = selectedSlot.split(':').map(Number);
      
      // Create a date object in the selected timezone
      const bookingDate = new Date(selectedDate);
      bookingDate.setHours(hours, minutes, 0, 0);
      
      // Convert from the active timezone to UTC for storage
      const utcDate = fromZonedTime(bookingDate, targetTz);
      
      setBooking({
        date: utcDate.toISOString(),
        slot: selectedSlot, // Keep for display convenience, but logic will rely on ISO date
      });
      onClose();
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
              !selectedSlot && styles.confirmButtonDisabled,
            ]}
            onPress={handleConfirm}
            disabled={!selectedSlot}
          >
            <Text style={styles.confirmButtonText}>Confirm Booking</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    backgroundColor: '#FFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 16,
    color: '#007AFF',
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
    fontWeight: '600',
    color: '#1C1C1E',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  closedContainer: {
    margin: 16,
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
  footer: {
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#A0A0A0',
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BookingModal;

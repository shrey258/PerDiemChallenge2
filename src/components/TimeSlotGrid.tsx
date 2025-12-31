import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';

interface TimeSlotGridProps {
  slots: string[];
  selectedSlot: string | null;
  onSelectSlot: (slot: string) => void;
}

const TimeSlotGrid: React.FC<TimeSlotGridProps> = ({
  slots,
  selectedSlot,
  onSelectSlot,
}) => {
  if (slots.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No available slots for this day.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.grid}>
        {slots.map((slot) => {
          const isSelected = selectedSlot === slot;
          return (
            <TouchableOpacity
              key={slot}
              style={[styles.slotButton, isSelected && styles.selectedSlotButton]}
              onPress={() => onSelectSlot(slot)}
              activeOpacity={0.7}
            >
              <Text style={[styles.slotText, isSelected && styles.selectedSlotText]}>
                {slot}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginHorizontal: -4,
  },
  slotButton: {
    width: '22%', // Roughly 4 columns
    aspectRatio: 2,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    margin: '1.5%',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  selectedSlotButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  slotText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  selectedSlotText: {
    color: '#FFF',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
});

export default TimeSlotGrid;

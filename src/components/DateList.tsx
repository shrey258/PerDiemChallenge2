import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { format, isSameDay } from 'date-fns';

interface DateListProps {
  dates: Date[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

const DateList: React.FC<DateListProps> = ({
  dates,
  selectedDate,
  onSelectDate,
}) => {
  const renderItem = ({ item }: { item: Date }) => {
    const isSelected = isSameDay(item, selectedDate);

    return (
      <TouchableOpacity
        style={[styles.dateCard, isSelected && styles.selectedDateCard]}
        onPress={() => onSelectDate(item)}
        activeOpacity={0.7}
      >
        <Text style={[styles.dayName, isSelected && styles.selectedText]}>
          {format(item, 'EEE')}
        </Text>
        <Text style={[styles.dayNumber, isSelected && styles.selectedText]}>
          {format(item, 'd')}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={dates}
        renderItem={renderItem}
        keyExtractor={(item) => item.getTime().toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  listContent: {
    paddingHorizontal: 12,
  },
  dateCard: {
    width: 60,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    marginHorizontal: 4,
  },
  selectedDateCard: {
    backgroundColor: '#007AFF',
  },
  dayName: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  selectedText: {
    color: '#FFF',
  },
});

export default DateList;

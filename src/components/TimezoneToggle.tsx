import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppStore } from '../store/useAppStore';

const TimezoneToggle: React.FC = () => {
  const { timezonePreference, toggleTimezone } = useAppStore();
  const isActiveNYC = timezonePreference === 'America/New_York';

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Timezone Preference</Text>
      <TouchableOpacity
        style={[styles.toggleBase, isActiveNYC ? styles.toggleNYC : styles.toggleLocal]}
        onPress={toggleTimezone}
        activeOpacity={0.7}
      >
        <Text style={styles.toggleText}>
          Active: {isActiveNYC ? 'NYC' : 'Local'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  toggleBase: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    minWidth: 100,
    alignItems: 'center',
  },
  toggleLocal: {
    backgroundColor: '#007AFF',
  },
  toggleNYC: {
    backgroundColor: '#FF9500',
  },
  toggleText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default TimezoneToggle;

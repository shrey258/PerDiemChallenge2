import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import HomeScreen from '../../../src/features/booking/HomeScreen';
import { useAppStore } from '../../../src/store/useAppStore';
import { useStoreData } from '../../../src/hooks/useStoreData';

// Mock store and hooks
jest.mock('../../../src/store/useAppStore', () => ({
  useAppStore: jest.fn(),
}));

jest.mock('../../../src/hooks/useStoreData', () => ({
  useStoreData: jest.fn(),
}));

// Mock safe area context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

describe('HomeScreen', () => {
  const mockLogout = jest.fn();
  const mockToggleTimezone = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state', () => {
    (useStoreData as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });
    (useAppStore as unknown as jest.Mock).mockReturnValue({
      timezonePreference: 'local',
      toggleTimezone: mockToggleTimezone,
      booking: null,
      logout: mockLogout,
    });

    const { queryByText } = render(<HomeScreen />);
    // Check for ActivityIndicator or a container that indicates loading
    // Since ActivityIndicator doesn't have text, we check for absence of content
    expect(queryByText('Store Status')).toBeNull();
  });

  it('renders store data correctly', () => {
    (useStoreData as jest.Mock).mockReturnValue({
      data: {
        times: [],
        overrides: [],
      },
      isLoading: false,
      error: null,
    });
    (useAppStore as unknown as jest.Mock).mockReturnValue({
      timezonePreference: 'local',
      toggleTimezone: mockToggleTimezone,
      booking: null,
      logout: mockLogout,
    });

    const { getByText } = render(<HomeScreen />);
    expect(getByText('Store Status')).toBeTruthy();
    expect(getByText('Time Context')).toBeTruthy();
  });

  it('toggles timezone when pressed', () => {
    (useStoreData as jest.Mock).mockReturnValue({
      data: { times: [], overrides: [] },
      isLoading: false,
      error: null,
    });
    (useAppStore as unknown as jest.Mock).mockReturnValue({
      timezonePreference: 'local',
      toggleTimezone: mockToggleTimezone,
      booking: null,
      logout: mockLogout,
    });

    const { getByText } = render(<HomeScreen />);
    fireEvent.press(getByText('Time Context'));
    expect(mockToggleTimezone).toHaveBeenCalled();
  });

  it('opens booking modal when FAB is pressed', async () => {
    (useStoreData as jest.Mock).mockReturnValue({
      data: { times: [], overrides: [] },
      isLoading: false,
      error: null,
    });
    (useAppStore as unknown as jest.Mock).mockReturnValue({
      timezonePreference: 'local',
      toggleTimezone: mockToggleTimezone,
      booking: null,
      logout: mockLogout,
    });

    const { getByText } = render(<HomeScreen />);
    fireEvent.press(getByText('Schedule'));
    
    // BookingModal is rendered inside HomeScreen
    await waitFor(() => {
      expect(getByText('Select Time')).toBeTruthy();
    });
  });
});

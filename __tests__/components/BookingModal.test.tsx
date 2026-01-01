import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import BookingModal from '../../src/components/BookingModal';
import { useAppStore } from '../../src/store/useAppStore';
import { StoreTime } from '../../src/types/api';

// Mock the store
jest.mock('../../src/store/useAppStore', () => ({
  useAppStore: jest.fn(),
}));

// Mock safe area context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

describe('BookingModal', () => {
  const mockSetBooking = jest.fn();
  const mockOnClose = jest.fn();
  
  const times: StoreTime[] = [
    { id: '1', day_of_week: 0, is_open: true, start_time: '09:00', end_time: '17:00' },
    { id: '2', day_of_week: 1, is_open: true, start_time: '09:00', end_time: '17:00' },
    { id: '3', day_of_week: 2, is_open: true, start_time: '09:00', end_time: '17:00' },
    { id: '4', day_of_week: 3, is_open: true, start_time: '09:00', end_time: '17:00' },
    { id: '5', day_of_week: 4, is_open: true, start_time: '09:00', end_time: '17:00' },
    { id: '6', day_of_week: 5, is_open: true, start_time: '09:00', end_time: '17:00' },
    { id: '7', day_of_week: 6, is_open: true, start_time: '09:00', end_time: '17:00' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useAppStore as unknown as jest.Mock).mockReturnValue({
      timezonePreference: 'local',
      setBooking: mockSetBooking,
    });
  });

  it('renders correctly when visible', () => {
    const { getByText } = render(
      <BookingModal
        visible={true}
        onClose={mockOnClose}
        times={times}
        overrides={[]}
      />
    );

    expect(getByText('Select Time')).toBeTruthy();
    expect(getByText('Date')).toBeTruthy();
  });

  it('calls onClose when close button is pressed', () => {
    const { getByText } = render(
      <BookingModal
        visible={true}
        onClose={mockOnClose}
        times={times}
        overrides={[]}
      />
    );

    fireEvent.press(getByText('Close'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('disables confirm button if no slot is selected', () => {
    const { getByText } = render(
      <BookingModal
        visible={true}
        onClose={mockOnClose}
        times={times}
        overrides={[]}
      />
    );

    const confirmButton = getByText('Confirm Appointment');
    expect(confirmButton).toBeTruthy();
    fireEvent.press(confirmButton);
    expect(mockSetBooking).not.toHaveBeenCalled();
  });

  it('enables confirm button and calls setBooking when slot is selected', async () => {
    const { getByText, queryAllByText } = render(
      <BookingModal
        visible={true}
        onClose={mockOnClose}
        times={times}
        overrides={[]}
      />
    );

    // Wait for availability calculation and slots to appear
    await waitFor(() => {
      const slots = queryAllByText(/:00/);
      expect(slots.length).toBeGreaterThan(0);
    });

    const slots = queryAllByText(/:00/);
    fireEvent.press(slots[0]);

    const confirmButton = getByText('Confirm Appointment');
    fireEvent.press(confirmButton);

    await waitFor(() => {
      expect(mockSetBooking).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    }, { timeout: 2000 });
  });
});

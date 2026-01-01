import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TimezoneToggle from '../../src/components/TimezoneToggle';
import { useAppStore } from '../../src/store/useAppStore';

jest.mock('../../src/store/useAppStore', () => ({
  useAppStore: jest.fn(),
}));

describe('TimezoneToggle', () => {
  const mockToggleTimezone = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with local timezone', () => {
    (useAppStore as unknown as jest.Mock).mockReturnValue({
      timezonePreference: 'local',
      toggleTimezone: mockToggleTimezone,
    });

    const { getByText } = render(<TimezoneToggle />);
    expect(getByText('Active: Local')).toBeTruthy();
  });

  it('renders correctly with New York timezone', () => {
    (useAppStore as unknown as jest.Mock).mockReturnValue({
      timezonePreference: 'America/New_York',
      toggleTimezone: mockToggleTimezone,
    });

    const { getByText } = render(<TimezoneToggle />);
    expect(getByText('Active: NYC')).toBeTruthy();
  });

  it('calls toggleTimezone when pressed', () => {
    (useAppStore as unknown as jest.Mock).mockReturnValue({
      timezonePreference: 'local',
      toggleTimezone: mockToggleTimezone,
    });

    const { getByText } = render(<TimezoneToggle />);
    fireEvent.press(getByText('Active: Local'));
    expect(mockToggleTimezone).toHaveBeenCalled();
  });
});

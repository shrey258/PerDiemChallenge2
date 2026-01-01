/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../src/App';
import { useAppStore } from '../src/store/useAppStore';

// Mock the store
jest.mock('../src/store/useAppStore', () => ({
  useAppStore: jest.fn(),
}));

describe('App', () => {
  beforeEach(() => {
    (useAppStore as unknown as jest.Mock).mockReturnValue({
      token: null,
      user: null,
      setUser: jest.fn(),
      setToken: jest.fn(),
    });
  });

  test('renders correctly', async () => {
    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(<App />);
    });
  });
});

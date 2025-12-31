import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { StoreOverride, StoreTime } from '../types/api';

const BASE_URL = 'https://coding-challenge-pd-1a25b1a14f34.herokuapp.com';

export const useStoreData = () => {
  return useQuery({
    queryKey: ['storeData'],
    queryFn: async () => {
      console.log('Fetching store data...');
      try {
        const [timesRes, overridesRes] = await Promise.all([
          axios.get<StoreTime[]>(`${BASE_URL}/store-times/`),
          axios.get<StoreOverride[]>(`${BASE_URL}/store-overrides/`),
        ]);

        console.log('Store Times Response:', JSON.stringify(timesRes.data, null, 2));
        console.log('Store Overrides Response:', JSON.stringify(overridesRes.data, null, 2));

        return {
          times: timesRes.data,
          overrides: overridesRes.data,
        };
      } catch (error) {
        console.error('API Fetch Error:', error);
        throw error;
      }
    },
  });
};

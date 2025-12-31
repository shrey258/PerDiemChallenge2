import axios from 'axios';
import { User } from '../types/api';

const API_URL = 'https://coding-challenge-pd-1a25b1a14f34.herokuapp.com';

interface AuthResponse {
  token: string;
}

export const login = async (email: string, password: string): Promise<string> => {
  const response = await axios.post<AuthResponse>(`${API_URL}/auth`, {
    email,
    password,
  });
  return response.data.token;
};

export const verifyToken = async (token: string): Promise<User> => {
  const response = await axios.get<User>(`${API_URL}/auth/verify`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

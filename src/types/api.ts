export interface StoreTime {
  id: string;
  day_of_week: number; // 0-6 (Sunday to Saturday)
  is_open: boolean;
  start_time: string; // "HH:mm"
  end_time: string; // "HH:mm"
}

export interface StoreOverride {
  id: string;
  day: number; // 1-31
  month: number; // 1-12
  is_open: boolean;
  start_time: string; // "HH:mm"
  end_time: string; // "HH:mm"
}

export interface User {
  userId: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

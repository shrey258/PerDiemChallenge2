import notifee, { TriggerType, TimestampTrigger, AndroidImportance } from '@notifee/react-native';
import { subHours, isAfter } from 'date-fns';

export const scheduleOpeningNotification = async (nextOpening: Date) => {
  console.log('[NotificationService] Attempting to schedule notification...');
  // 1. Request permissions (required for iOS)
  const settings = await notifee.requestPermission();
  console.log('[NotificationService] Permission status:', settings.authorizationStatus);

  // 2. Production: Trigger 1 hour before opening
  const triggerTime = subHours(nextOpening, 1);
  console.log('[NotificationService] Calculated trigger time:', triggerTime.toLocaleString());

  // 3. Keep logic for safety
  if (!isAfter(triggerTime, new Date())) {
    console.log('[NotificationService] Trigger time is in the past, skipping.');
    return;
  }

  // 4. Create a channel (required for Android)
  const channelId = await notifee.createChannel({
    id: 'store-opening',
    name: 'Store Opening Alerts',
    importance: AndroidImportance.HIGH,
  });

  // 5. Create the trigger
  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: triggerTime.getTime(),
  };

  // 6. Schedule the notification
  await notifee.createTriggerNotification(
    {
      id: 'store-opening-alert',
      title: 'Store Opening Soon!',
      body: 'The NYC store will open in one hour. Get ready to book your slot!',
      android: {
        channelId,
        pressAction: {
          id: 'default',
        },
      },
    },
    trigger
  );
  console.log('[NotificationService] Notification scheduled successfully with ID: store-opening-alert');
};

export const cancelOpeningNotifications = async () => {
  console.log('[NotificationService] Cancelling pending opening notifications...');
  await notifee.cancelNotification('store-opening-alert');
};

export const triggerDemoNotification = async () => {
  console.log('[NotificationService] Triggering demo notification (10s delay)...');
  const triggerTime = new Date(Date.now() + 10000);
  
  const channelId = await notifee.createChannel({
    id: 'store-demo',
    name: 'Demo Alerts',
    importance: AndroidImportance.HIGH,
  });

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: triggerTime.getTime(),
  };

  await notifee.createTriggerNotification(
    {
      id: 'demo-alert',
      title: 'Demo: Store Opening Soon!',
      body: 'This is a demo notification. The store will open in one hour!',
      android: {
        channelId,
        pressAction: {
          id: 'default',
        },
      },
    },
    trigger
  );
  console.log('[NotificationService] Demo notification scheduled for:', triggerTime.toLocaleString());
};

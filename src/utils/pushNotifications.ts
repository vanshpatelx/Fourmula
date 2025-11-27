import { supabase } from '@/integrations/supabase/client';

// Convert VAPID public key from URL-safe base64 to Uint8Array
const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

// Check if push notifications are supported
export const isPushSupported = (): boolean => {
  return 'serviceWorker' in navigator && 'PushManager' in window;
};

// Register service worker
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!isPushSupported()) {
    console.warn('Push notifications are not supported in this browser');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/'
    });
    console.log('Service Worker registered successfully:', registration);
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.warn('Notifications are not supported in this browser');
    return 'denied';
  }

  const permission = await Notification.requestPermission();
  console.log('Notification permission:', permission);
  return permission;
};

// Subscribe to push notifications
export const subscribeToPushNotifications = async (
  userId: string
): Promise<PushSubscription | null> => {
  try {
    // First ensure service worker is registered
    const registration = await registerServiceWorker();
    if (!registration) {
      throw new Error('Service Worker registration failed');
    }

    // Wait for service worker to be ready
    await navigator.serviceWorker.ready;

    // Request notification permission only if needed
    let permission: NotificationPermission = Notification.permission;
    if (permission === 'default') {
      permission = await requestNotificationPermission();
    }
    if (permission !== 'granted') {
      throw new Error('Notification permission denied');
    }

    // Check for existing subscription
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      const vapidKey = (import.meta as any).env?.VITE_VAPID_PUBLIC_KEY as string | undefined;
      if (vapidKey) {
        const key = urlBase64ToUint8Array(vapidKey);
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          // Cast to BufferSource for TS compatibility
          applicationServerKey: key as unknown as BufferSource
        });
        console.log('New push subscription created:', subscription);
      } else {
        console.warn('No VAPID public key configured; skipping push subscription. Local notifications will work, but server push is disabled.');
      }
    } else {
      console.log('Existing push subscription found:', subscription);
    }

    // Save subscription to database
    if (subscription) {
      const subscriptionJSON = subscription.toJSON();
      
      await supabase.from('notification_subscriptions').upsert({
        user_id: userId,
        endpoint: subscriptionJSON.endpoint || '',
        p256dh: subscriptionJSON.keys?.p256dh || '',
        auth: subscriptionJSON.keys?.auth || ''
      }, {
        onConflict: 'user_id'
      });

      console.log('Subscription saved to database');
    }

    return subscription;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return null;
  }
};

// Unsubscribe from push notifications
export const unsubscribeFromPushNotifications = async (userId: string): Promise<boolean> => {
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      return false;
    }

    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      console.log('Unsubscribed from push notifications');
    }

    // Remove from database
    await supabase
      .from('notification_subscriptions')
      .delete()
      .eq('user_id', userId);

    return true;
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    return false;
  }
};

// Test notification
export const sendTestNotification = async (): Promise<void> => {
  if (!('Notification' in window)) {
    console.warn('Notifications are not supported');
    return;
  }

  if (Notification.permission === 'granted') {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification('🔔 Test Notification', {
      body: 'This is how your supplement reminders will look and sound! 💊',
      icon: '/ai-favicon.png',
      badge: '/ai-favicon.png',
      tag: 'test-notification',
      requireInteraction: false,
      silent: false,
      vibrate: [200, 100, 200] as any,
      actions: [
        { action: 'open', title: 'Open App' }
      ]
    } as NotificationOptions);
  }
};

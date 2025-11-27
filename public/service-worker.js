// Service Worker for Push Notifications
const CACHE_NAME = 'fourmula-v1';

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(self.clients.claim());
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  let notificationData = {
    title: 'Supplement Reminder',
    body: 'Time to take your supplements! 💊',
    icon: '/ai-favicon.png',
    badge: '/ai-favicon.png',
    vibrate: [200, 100, 200],
    tag: 'supplement-reminder',
    requireInteraction: false,
    silent: false,
    data: {
      url: '/dashboard',
      timestamp: Date.now()
    }
  };

  // Parse push data if available
  if (event.data) {
    try {
      const payload = event.data.json();
      notificationData = {
        ...notificationData,
        ...payload,
        // Add sound by default (browser will use system notification sound)
        silent: false
      };
    } catch (e) {
      console.error('Error parsing push data:', e);
    }
  }

  // Show notification with actions
  const promiseChain = self.registration.showNotification(notificationData.title, {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    vibrate: notificationData.vibrate,
    tag: notificationData.tag,
    requireInteraction: notificationData.requireInteraction,
    silent: notificationData.silent,
    data: notificationData.data,
    actions: [
      {
        action: 'mark-taken',
        title: 'Mark as Taken ✓',
        icon: '/ai-favicon.png'
      },
      {
        action: 'view',
        title: 'Open App',
        icon: '/ai-favicon.png'
      }
    ]
  });

  event.waitUntil(promiseChain);
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  const action = event.action;
  const notificationData = event.notification.data;

  if (action === 'mark-taken') {
    // Call the mark-taken edge function
    event.waitUntil(
      fetch('https://wscbqaowafweppryqyrs.supabase.co/functions/v1/mark-taken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzY2JxYW93YWZ3ZXBwcnlxeXJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4ODYyODMsImV4cCI6MjA3MTQ2MjI4M30.OdEaf39yWEkwBPPKWYiOtRUFAgK_DoY0MPzZJ_gNdQE'
        },
        body: JSON.stringify({
          date: new Date().toISOString().split('T')[0]
        })
      }).then(response => {
        console.log('Mark taken response:', response);
        return self.registration.showNotification('Supplement Logged!', {
          body: 'Great job! Keep up the streak! 🎉',
          icon: '/ai-favicon.png',
          tag: 'supplement-confirmation',
          requireInteraction: false,
          silent: false
        });
      }).catch(error => {
        console.error('Error marking as taken:', error);
      })
    );
  } else {
    // Open the app
    const urlToOpen = notificationData?.url || '/dashboard';
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((windowClients) => {
          // Check if there's already a window open
          for (let client of windowClients) {
            if (client.url.includes(urlToOpen) && 'focus' in client) {
              return client.focus();
            }
          }
          // If not, open a new window
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  }
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
});

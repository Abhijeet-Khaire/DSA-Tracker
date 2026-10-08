// Web Push Notification Helper for Due DSA Revisions

export function requestNotificationPermission() {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
    Notification.requestPermission();
  }
}

export function sendRevisionNotification(dueCount) {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted' && dueCount > 0) {
    new Notification('GrindTrack Revision Reminder 🧠', {
      body: `You have ${dueCount} DSA problem(s) due for spaced repetition today!`,
      icon: '/favicon.ico',
    });
  }
}

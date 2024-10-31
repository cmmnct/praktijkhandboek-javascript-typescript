import { Subject } from 'rxjs';

interface ToastNotification {
  message: string;
  duration?: number;
  color?: string;
  position?: 'top' | 'bottom' | 'middle';
}

const toastNotificationSubject = new Subject<ToastNotification>();

export const notificationService = {
  sendToastNotification: (
    message: string,
    color: string = 'success',
    duration: number = 3000,
    position: 'top' | 'bottom' | 'middle' = 'top'
  ) => {
    toastNotificationSubject.next({ message, color, duration, position });
  },
  toastNotificationSubject,
};

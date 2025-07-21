/**
 * Enhanced notification system for displaying user feedback
 *
 * This utility provides a consistent way to show notifications for different
 * actions throughout the extension, with appropriate styling and icons.
 */

// Action types for more specific notification styling and icons
export type NotificationType = 'success' | 'error' | 'info' | 'warning';
export type NotificationAction =
  | 'clipboard' // For copy operations
  | 'bookmark' // For bookmark operations
  | 'auth' // For authentication operations
  | 'subscription' // For subscription-related messages
  | 'color' // For color picker operations
  | 'font' // For font operations
  | 'asset' // For asset extraction
  | 'system' // For system messages
  | 'general'; // Default for general messages

interface NotificationOptions {
  message: string;
  type?: NotificationType;
  action?: NotificationAction;
  duration?: number;
  onClose?: () => void;
}

/**
 * Show a notification with the specified parameters
 *
 * @param message Message to display or notification options object
 * @param type Type of notification (success, error, info, warning)
 * @param duration Duration in milliseconds
 * @returns Function to close the notification
 */
export function showNotification(
  messageOrOptions: string | NotificationOptions,
  type: NotificationType = 'info',
  duration: number = 3000
): () => void {
  // Parse parameters
  let message: string;
  let notificationType: NotificationType = type;
  let notificationDuration: number = duration;
  let notificationAction: NotificationAction = 'general';
  let onClose: (() => void) | undefined;

  if (typeof messageOrOptions === 'object') {
    message = messageOrOptions.message;
    notificationType = messageOrOptions.type || notificationType;
    notificationDuration = messageOrOptions.duration || notificationDuration;
    notificationAction = messageOrOptions.action || notificationAction;
    onClose = messageOrOptions.onClose;
  } else {
    message = messageOrOptions;
  }

  // Create wrapper element
  const notificationWrapper = document.createElement('div');

  // Get icon HTML based on type and action
  const iconHtml = getIconForNotification(notificationType, notificationAction);

  // Create notification with the appropriate styling
  notificationWrapper.innerHTML = `
    <div class="notification-content">
      ${iconHtml}
      <span>${message}</span>
    </div>
  `;

  // Style based on notification type
  const baseStyles = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 16px;
    color: white;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    z-index: 2147483647;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border-radius: 6px;
    transition: opacity 0.3s ease, transform 0.3s ease;
    display: flex;
    align-items: center;
    max-width: 320px;
    transform: translateY(0);
    opacity: 0;
  `;

  let backgroundColor = '#3b82f6'; // Default blue for info

  if (notificationType === 'success') {
    backgroundColor = '#10b981'; // Green
  } else if (notificationType === 'error') {
    backgroundColor = '#ef4444'; // Red
  } else if (notificationType === 'warning') {
    backgroundColor = '#f59e0b'; // Amber
  }

  // Add action-specific styling
  let actionSpecificStyles = '';
  if (notificationAction === 'clipboard') {
    actionSpecificStyles = 'border-left: 4px solid #8b5cf6;'; // Purple for clipboard
  } else if (notificationAction === 'bookmark') {
    actionSpecificStyles = 'border-left: 4px solid #f97316;'; // Orange for bookmark
  } else if (notificationAction === 'auth') {
    actionSpecificStyles = 'border-left: 4px solid #059669;'; // Green for auth
  }

  notificationWrapper.style.cssText = `
    ${baseStyles}
    background-color: ${backgroundColor};
    ${actionSpecificStyles}
  `;

  // Additional styles for the notification content
  const contentEl = notificationWrapper.querySelector('.notification-content');
  if (contentEl) {
    contentEl.setAttribute(
      'style',
      `
      display: flex;
      align-items: center;
      gap: 8px;
    `
    );
  }

  // Add to document
  document.body.appendChild(notificationWrapper);

  // Fade in animation
  setTimeout(() => {
    notificationWrapper.style.opacity = '1';
    notificationWrapper.style.transform = 'translateY(0)';
  }, 10);

  // Function to close the notification
  const closeNotification = () => {
    notificationWrapper.style.opacity = '0';
    notificationWrapper.style.transform = 'translateY(-10px)';

    setTimeout(() => {
      if (notificationWrapper.parentNode) {
        document.body.removeChild(notificationWrapper);
        if (onClose) onClose();
      }
    }, 300);
  };

  // Close automatically after duration
  const timeoutId = setTimeout(() => {
    closeNotification();
  }, notificationDuration);

  // Allow manual closing
  notificationWrapper.addEventListener('click', () => {
    clearTimeout(timeoutId);
    closeNotification();
  });

  return closeNotification;
}

/**
 * Generate icon HTML based on notification type and action
 */
function getIconForNotification(type: NotificationType, action: NotificationAction): string {
  // Base SVG wrapper with consistent styling
  const svgWrapper = (pathContent: string) => `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      ${pathContent}
    </svg>
  `;

  // Default icons based on notification type
  if (type === 'success') {
    return svgWrapper(
      '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>'
    );
  } else if (type === 'error') {
    return svgWrapper(
      '<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>'
    );
  } else if (type === 'warning') {
    return svgWrapper(
      '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>'
    );
  }

  // Action-specific icons override the type icons
  switch (action) {
    case 'clipboard':
      return svgWrapper(
        '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>'
      );

    case 'bookmark':
      return svgWrapper('<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>');

    case 'auth':
      return svgWrapper(
        '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>'
      );

    case 'subscription':
      return svgWrapper(
        '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><line x1="2" y1="10" x2="22" y2="10"></line>'
      );

    case 'color':
      return svgWrapper('<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>');

    case 'font':
      return svgWrapper(
        '<polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line>'
      );

    case 'asset':
      return svgWrapper(
        '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline>'
      );

    default:
      return svgWrapper(
        '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>'
      );
  }
}

/**
 * Show a clipboard notification with appropriate styling
 */
export function showClipboardNotification(message: string = 'Copied to clipboard'): void {
  showNotification({
    message,
    type: 'success',
    action: 'clipboard',
    duration: 2000, // Shorter duration for clipboard actions
  });
}

/**
 * Show a bookmark notification with appropriate styling
 */
export function showBookmarkNotification(message: string, isSuccess: boolean = true): void {
  showNotification({
    message,
    type: isSuccess ? 'success' : 'error',
    action: 'bookmark',
  });
}

/**
 * Show an authentication notification with appropriate styling
 */
export function showAuthNotification(message: string, isSuccess: boolean = true): void {
  showNotification({
    message,
    type: isSuccess ? 'success' : 'error',
    action: 'auth',
  });
}

/**
 * Show a color picker notification with appropriate styling
 */
export function showColorNotification(message: string): void {
  showNotification({
    message,
    type: 'success',
    action: 'color',
    duration: 2000,
  });
}

/**
 * Show a font notification with appropriate styling
 */
export function showFontNotification(message: string): void {
  showNotification({
    message,
    type: 'success',
    action: 'font',
    duration: 2000,
  });
}

/**
 * Show a subscription notification with appropriate styling
 */
export function showSubscriptionNotification(message: string, isWarning: boolean = true): void {
  showNotification({
    message,
    type: isWarning ? 'warning' : 'info',
    action: 'subscription',
    duration: 4000, // Longer duration for subscription messages
  });
}

export default showNotification;

import { Platform } from 'react-native';

// Notifee is native-only, so we import it conditionally or wrap calls
let notifee: any = null;
let AndroidImportance: any = null;
let TriggerType: any = null;

if (Platform.OS !== 'web') {
    try {
        const NotifeePkg = require('@notifee/react-native');
        notifee = NotifeePkg.default;
        AndroidImportance = NotifeePkg.AndroidImportance;
        TriggerType = NotifeePkg.TriggerType;
    } catch (e) {
        console.warn('Notifee could not be loaded:', e);
    }
}

export const requestNotificationPermissions = async () => {
    if (Platform.OS === 'web' || !notifee) return;
    await notifee.requestPermission();
};

export const scheduleReminder = async (taskId: string, title: string, body: string, date: Date) => {
    if (Platform.OS === 'web' || !notifee) {
        console.log('Skipping reminder scheduling on web');
        return;
    }

    // Create a channel (required for Android)
    const channelId = await notifee.createChannel({
        id: 'reminders',
        name: 'Task Reminders',
        importance: AndroidImportance?.HIGH || 4,
    });

    // Create a time-based trigger
    const trigger = {
        type: TriggerType?.TIMESTAMP || 0,
        timestamp: date.getTime(),
    };

    // Schedule the notification
    await notifee.createTriggerNotification(
        {
            id: taskId,
            title: title,
            body: body,
            android: {
                channelId,
                importance: AndroidImportance?.HIGH || 4,
                pressAction: {
                    id: 'default',
                },
            },
        },
        trigger,
    );
};

export const cancelReminder = async (taskId: string) => {
    if (Platform.OS === 'web' || !notifee) return;
    await notifee.cancelNotification(taskId);
};

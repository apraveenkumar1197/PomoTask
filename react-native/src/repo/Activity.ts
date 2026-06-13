import Base from '../api/Base';

export default class Activity {
    static create(
        title: string,
        dueDate: string | null = null,
        fromTime: string | null = null,
        toTime: string | null = null,
        notes: string | null = null,
        tags: string[] | null = null
    ) {
        const activityData: Record<string, any> = { title };
        if (dueDate) activityData['due_date'] = dueDate;
        if (fromTime) activityData['from_time'] = fromTime;
        if (toTime) activityData['to_time'] = toTime;
        if (notes) activityData['notes'] = notes;
        if (tags && tags.length > 0) activityData['tags'] = tags;
        return Base.post('activity/create', { activity: activityData });
    }

    static update(
        activityId: string,
        title: string | null = null,
        dueDate: string | null = null,
        fromTime: string | null = null,
        toTime: string | null = null,
        notes: string | null = null,
        tags: string[] | null = null
    ) {
        const activityData: Record<string, any> = {};
        if (title) activityData['title'] = title;
        if (dueDate) activityData['due_date'] = dueDate;
        if (fromTime) activityData['from_time'] = fromTime;
        if (toTime) activityData['to_time'] = toTime;
        if (notes) activityData['notes'] = notes;
        if (tags && tags.length > 0) activityData['tags'] = tags;
        return Base.patch(`activity/${activityId}`, { activity: activityData });
    }

    static delete(activityId: string) {
        return Activity.update(activityId, null, null, null, null, null);
    }
}

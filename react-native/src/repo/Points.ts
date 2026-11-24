import Base from '../api/Base';

export type Repeat = 'daily' | 'weekdays' | 'interval' | 'weekly' | 'monthly';

export interface PointSettings {
    title: string;
    start_date: string;
    repeat: Repeat;
    weekdays: number[];
    interval: number | null;
    weekday: number | null;
    month_day: number | null;
    show_task: boolean;
    from_time: string | null;
    to_time: string | null;
}

export interface PointItem {
    id: string;
    rule: PointSettings;
    settings: PointSettings & { effective: string };
    period_start: string | null;
    period_end: string | null;
    achieved: boolean;
    next_due: string | null;
    planned_date: string | null;
    from_time: string | null;
    to_time: string | null;
}

export interface PointMonth {
    through: string;
    achieved: number;
    due: number;
    items: { id: string; title: string; achieved: number; due: number }[];
}

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function repeatLabel(rule: PointSettings) {
    switch (rule.repeat) {
        case 'daily': return 'Every day';
        case 'weekdays': return rule.weekdays.map(day => WEEKDAYS[day]).join(', ');
        case 'interval': return `Every ${rule.interval} days`;
        case 'weekly': return rule.weekday === null ? 'Every week' : `Every week · ${WEEKDAYS[rule.weekday]}`;
        case 'monthly': return rule.month_day === null ? 'Every month' : `Every month · day ${rule.month_day}`;
    }
}

export function pointsError(error: unknown, fallback: string) {
    const message = (error as { response?: { data?: { msg?: unknown } } })?.response?.data?.msg;
    return typeof message === 'string' ? message : fallback;
}

export default class Points {
    static async list(date?: string): Promise<{ items: PointItem[]; today: string }> {
        const res = await Base.get(date ? `points/items?date=${encodeURIComponent(date)}` : 'points/items');
        return res.data.data;
    }

    static async save(settings: PointSettings, id?: string): Promise<{ id: string; effective?: string }> {
        const res = id ? await Base.put(`points/items/${id}`, settings) : await Base.post('points/items', settings);
        return res.data.data;
    }

    static async checkIn(id: string, day: string, achieved: boolean) {
        await Base.put(`points/items/${id}/check-in/${day}`, { achieved });
    }

    static async summary(month?: string): Promise<PointMonth> {
        const res = await Base.get(month ? `points/summary?month=${encodeURIComponent(month)}` : 'points/summary');
        return res.data.data;
    }
}

import Base from '../api/Base';

export interface DairyEntry {
    id: string | null;
    date: string;
    text: string;
    created_at?: string | null;
    updated_at?: string | null;
}

export class Dairy {
    static getByDate(date: string) {
        return Base.get(`dairy/${date}`, true, Base.BASE_URL_MS1);
    }

    static saveDairy(date: string, text: string) {
        return Base.post('dairy', {
            date: date,
            text: text,
        }, true, Base.BASE_URL_MS1);
    }
}

export default Dairy;

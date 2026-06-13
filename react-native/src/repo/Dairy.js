import Base from "../api/Base";

export class Dairy {
    static getByDate(date) {
        return Base.get(`dairy/${date}`, true, Base.BASE_URL_MS2);
    }
    static saveDairy(date, text) {
        return Base.post('dairy', {
            date: date,
            text: text,
        }, true, Base.BASE_URL_MS2);
    }
}

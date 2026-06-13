export const dateTimeCeilTo15Minutes = (date: Date): Date => {
    const ms = 15 * 60 * 1000;
    return new Date(Math.ceil(date.getTime() / ms) * ms);
};

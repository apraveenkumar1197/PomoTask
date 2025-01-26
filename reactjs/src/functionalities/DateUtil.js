import dayjs from "dayjs";


class DateUtil {
    date = null;
    static timeFormat = 'HH:mm:ss'
    static dateFormat = 'YYYY-MM-DD'
    static dateTimeFormat = 'YYYY-MM-DD HH:mm:ss'

    static MONTH_LIST = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    constructor(date = null, format = DateUtil.dateFormat) {
        if (typeof date == 'string') date = dayjs(date, format)
        if (date != null) this.date = dayjs(date)
    }

    mySQLDate = () => {
        if (this.date == null) return null

        return this.date.format(DateUtil.dateFormat)
    }

    mySQLTime = () => {
        if (this.date == null) return null

        return this.date.format(DateUtil.timeFormat)
    }

    mySQLDateTime = () => {
        if (this.date == null) return null

        return this.date.format(DateUtil.dateTimeFormat)
    }

    mySQLMonth = () => {
        if (this.date == null) return null

        this.date.format('YYYY-MM')
    }

    allMonths = (currentMonth =  new Date().getMonth()) => {
        const monthNames = DateUtil.MONTH_LIST

        const monthsArray = [];
        for (let i = currentMonth; i < monthNames.length; i++) {
            monthsArray.push(monthNames[i]);
        }
        return monthsArray;
    }
}

export default DateUtil
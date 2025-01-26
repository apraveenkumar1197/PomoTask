
class Util {
    static mySQLDate = (dateObj = null) => {
        let newDate = new Date()
        if(dateObj != null) newDate = dateObj
        let date = newDate.getDate();
        let month = newDate.getMonth() + 1;
        let year = newDate.getFullYear();
        return year + "-" + month.toString().padStart(2, '0') + "-" + date.toString().padStart(2, '0');
    }

    static mySQLMonth = (dateObj = null) => {
        let newDate = new Date()
        if(dateObj != null) newDate = dateObj
        let month = newDate.getMonth() + 1;
        let year = newDate.getFullYear();
        return year + "-" + month.toString().padStart(2, '0');
    }

    static numberFormatter = () => {
        return new Intl.NumberFormat('en-IN')
    }
}
export default Util
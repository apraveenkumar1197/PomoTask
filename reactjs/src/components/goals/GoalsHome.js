import {
    Grid
} from "@mui/material";
import dayjs from 'dayjs';
import YearlyGoalList from "./YearlyGoalList";
import React from "react";
import MonthlyGoalList from "./MonthlyGoalList";
import DateUtil from "../../functionalities/DateUtil";

function GoalsHome({
                       setSnackbarMessage,
                       setOpenSnackbar
                   }) {

    const [year, setYear] = React.useState(dayjs().year())
    const [month, setMonth] = React.useState(DateUtil.MONTH_LIST[dayjs().month()])

    return <Grid container>
        <Grid item xs={12} md={6} style={{paddingRight: '3px'}}>
            <YearlyGoalList
                setSnackbarMessage={setSnackbarMessage}
                setOpenSnackbar={setOpenSnackbar}
                year={year}
            />
        </Grid>
        <Grid item xs={12} md={6}>
            <MonthlyGoalList
                setSnackbarMessage={setSnackbarMessage}
                setOpenSnackbar={setOpenSnackbar}
                year={year}
                month={month}/>
        </Grid>
    </Grid>
}

export default GoalsHome
import React from "react";
import {
    Autocomplete, Chip,
    Grid, MenuItem, Select,
    TextField
} from "@mui/material";
import dayjs from 'dayjs';
import {LoadingButton} from "../../ui/LoadingButton";
import {SmallOutlinedTextBox} from "../../ui/SmallOutlinedTextBox";
import Goal from "../../repo/Goal";
import DateUtil from "../../functionalities/DateUtil";
import YearlyGoalList from "./YearlyGoalList";

export const CreateYearlyGoal = (props) => {
    const [goalId, setGoalId] = React.useState(null);
    const [goalUpdate, setGoalUpdate] = React.useState(false);

    const [year, setYear] = React.useState(dayjs().year())
    const [title, setTitle] = React.useState('')
    const [months, setMonths] = React.useState([])

    const [loading, setLoading] = React.useState(false)
    const [listReload, setListReload] = React.useState(false)

    const handleMonthsChange = (event, newValue) => {
        const sortedList = newValue.sort((a, b) => {
            const indexA = DateUtil.MONTH_LIST.indexOf(a);
            const indexB = DateUtil.MONTH_LIST.indexOf(b);

            // If an element is not found in orderList, treat it as larger (push it to the end)
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;

            // Compare the positions in orderList
            return indexA - indexB;
        });
        setMonths(sortedList);
    }

    const addYearlyGoal = () => {
        setLoading(true)
        Goal.createYearlyGoal(title, year, months).then((res) => {
            props.setSnackbarMessage(res.data.msg)
            props.setOpenSnackbar(true)
            setLoading(false)
            resetForm();
        }).catch((err) => {
            props.setSnackbarMessage(err.response.data.msg)
            props.setOpenSnackbar(true)
            setLoading(false)
        });
    }

    const editYearlyGoal = (goal) => {
        setLoading(true)
        Goal.editGoal(goal.id).then((res) => {
            setLoading(false)
            editForm(res.data.data.goal);
        }).catch((err) => {
            props.setSnackbarMessage(err.response.data.msg)
            props.setOpenSnackbar(true)
            setLoading(false)
        });
    }

    const editForm = (goalData) => {
        setGoalUpdate(true)
        setGoalId(goalData.id)

        setTitle(goalData.title)
        setMonths(goalData.months)
    }

    const updateYearlyGoal = () => {
        setLoading(true)
        Goal.updateYearlyGoal(goalId, title, year, months).then((res) => {
            props.setSnackbarMessage(res.data.msg)
            props.setOpenSnackbar(true)
            setLoading(false)
            resetForm();
        }).catch((err) => {
            props.setSnackbarMessage(err.response.data.msg)
            props.setOpenSnackbar(true)
            setLoading(false)
        });
    }

    const deleteGoal = (goal) => {
        setLoading(true)
        Goal.deleteGoal(goal.id).then((res) => {
            props.setSnackbarMessage(res.data.msg)
            props.setOpenSnackbar(true)
            setListReload(!listReload)
            setLoading(false)
        }).catch((err) => {
            props.setSnackbarMessage(err.response.data.msg)
            props.setOpenSnackbar(true)
            setLoading(false)
        });
    }

    const resetForm = () => {
        setTitle('')
        setMonths([])

        setGoalId(null)
        setGoalUpdate(false)

        setListReload(!listReload)
    }

    React.useEffect(() => {

    }, []);


    return <Grid container>
        <Grid item xs={12} md={4}>
            <Grid container style={{padding: 10}} spacing={0}>
                <Grid item>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={year}
                        label="Age"
                        onChange={(e) => setYear(e.target.value)}>
                        {[-1, 0, 1, 2].map((i) => (
                            <MenuItem key={`year-${i}`} value={dayjs().year() + i}>
                                {dayjs().year() + i}
                            </MenuItem>
                        ))}
                    </Select>
                </Grid>
            </Grid>
            <Grid container style={{padding: 10}} spacing={0}>
                <Grid item xs={12} md={12} lg={12}>
                    <SmallOutlinedTextBox id="test-text-field" label="Title" value={title}
                                          onInput={(e) => setTitle(e.target.value)}/>
                </Grid>
            </Grid>
            <Grid container style={{padding: 10}} spacing={0}>
                <Grid item xs={12} md={8} lg={8}>
                    <Autocomplete
                        clearIcon={false}
                        value={months}
                        options={DateUtil.MONTH_LIST}
                        onChange={handleMonthsChange}
                        freeSolo
                        multiple
                        renderTags={(value, props) =>
                            value.map((option, index) => (
                                <Chip label={option} {...props({index})} />
                            ))
                        }
                        renderInput={(params) => <TextField label="Months" {...params} />}/>
                </Grid>
            </Grid>
            <Grid container style={{padding: 10}} spacing={0}>
                {
                    goalUpdate ?
                        <LoadingButton variant="contained" disabled={loading} onClick={updateYearlyGoal}>Update
                            Goal</LoadingButton> :
                        <LoadingButton variant="contained" disabled={loading} onClick={addYearlyGoal}>Add
                            Goal</LoadingButton>

                }
            </Grid>
        </Grid>
        <Grid item xs={12} md={1}></Grid>
        <Grid item xs={12} md={6}>
            <YearlyGoalList
                setSnackbarMessage={props.setSnackbarMessage}
                setOpenSnackbar={props.setOpenSnackbar}
                year={year}
                listReload={listReload}
                editYearlyGoal={editYearlyGoal}
                deleteGoal={deleteGoal}
            />
        </Grid>
    </Grid>
}
import {Autocomplete, Chip, Grid, MenuItem, Select, TextField} from "@mui/material";
import dayjs from "dayjs";
import {SmallOutlinedTextBox} from "../../ui/SmallOutlinedTextBox";
import {LoadingButton} from "../../ui/LoadingButton";
import YearlyGoalList from "./YearlyGoalList";
import React from "react";
import DateUtil from "../../functionalities/DateUtil";
import MonthlyGoalList from "./MonthlyGoalList";
import Goal from "../../repo/Goal";

function CreateMonthlyGoal({
                               setSnackbarMessage,
                               setOpenSnackbar,
                           }) {
    const [goalId, setGoalId] = React.useState(null);
    const [goalUpdate, setGoalUpdate] = React.useState(false);

    const [year, setYear] = React.useState(dayjs().year())
    const [month, setMonth] = React.useState(DateUtil.MONTH_LIST[dayjs().month()])
    const [title, setTitle] = React.useState('')
    const [linkedYearlyGoals, setLinkedYearlyGoals] = React.useState([])
    const [yearlyGoals, setYearlyGoals] = React.useState([])

    const [loading, setLoading] = React.useState(false)
    const [listReload, setListReload] = React.useState(false)


    const handleLinkedYearlyGoalsChange = (event, newValue) => {
        let uniqIds = []
        let uniqValues = []
        newValue.forEach((goal) => {
            if (!uniqIds.includes(goal.id)) {
                uniqValues.push(goal)
                uniqIds.push(goal.id)
            }
        })
        setLinkedYearlyGoals(uniqValues)
    }

    const getMiniGoalList = () => {
        Goal.listByYear(year, true).then((res) => {
            setYearlyGoals(res.data.data.goals)
            setLoading(false)
        }).catch((err) => {
            setSnackbarMessage(err.response.data.msg)
            setOpenSnackbar(true)
            setLoading(false)
        });
    }

    const createMonthlyGoal = () => {
        setLoading(true)
        Goal.createMonthlyGoal(year, month, title, linkedYearlyGoals.map((goal) => goal.id)).then((res) => {
            setSnackbarMessage(res.data.msg)
            setOpenSnackbar(true)
            setLoading(false)
            setListReload(!listReload)
            resetForm();
        }).catch((err) => {
            setSnackbarMessage(err.response.data.msg)
            setOpenSnackbar(true)
            setLoading(false)
        });
    }

    const editMonthlyGoal = (goal) => {
        setLoading(true)
        Goal.editGoal(goal.id).then((res) => {
            setLoading(false)
            editForm(res.data.data.goal);
        }).catch((err) => {
            setSnackbarMessage(err.response.data.msg)
            setOpenSnackbar(true)
            setLoading(false)
        });
    }

    const editForm = (goalData) => {
        setGoalUpdate(true)
        setGoalId(goalData.id)

        setTitle(goalData.title)
        setLinkedYearlyGoals(goalData.linked_goals)
    }

    const updateMonthlyGoal = () => {
        setLoading(true)
        Goal.updateMonthlyGoal(goalId, year, month, title, linkedYearlyGoals.map((goal) => goal.id)).then((res) => {
            setSnackbarMessage(res.data.msg)
            setOpenSnackbar(true)
            setLoading(false)
            resetForm();
        }).catch((err) => {
            setSnackbarMessage(err.response.data.msg)
            setOpenSnackbar(true)
            setLoading(false)
        });
    }

    const deleteMonthlyGoal = (goal) => {
        Goal.deleteGoal(goal.id).then((res) => {
            setSnackbarMessage(res.data.msg)
            setOpenSnackbar(true)
            setListReload(!listReload)
            setLoading(false)
        }).catch((err) => {
            setSnackbarMessage(err.response.data.msg)
            setOpenSnackbar(true)
            setLoading(false)
        });
    }

    const resetForm = () => {
        setTitle('')
        setLinkedYearlyGoals([])

        setGoalId(null)
        setGoalUpdate(false)
    }

    React.useEffect(() => {
        getMiniGoalList()
        setListReload(!listReload)
    }, [year, month])

    return <Grid container>
        <Grid item xs={12} md={3}>
            <Grid container style={{padding: 10}} spacing={0}>
                <Grid item spacing={2}>
                    <Select
                        value={year}
                        label="Age"
                        onChange={(e) => setYear(e.target.value)}>
                        {[0, 1].map((i) => (
                            <MenuItem key={`year-${i}`} value={dayjs().year() + i}>
                                {dayjs().year() + i}
                            </MenuItem>
                        ))}
                    </Select>
                </Grid>
                <Grid item xs={1} md={1}></Grid>
                <Grid item>
                    <Select
                        value={month}
                        label="Age"
                        onChange={(e) => setMonth(e.target.value)}>
                        {DateUtil.MONTH_LIST.map((month) => (
                            <MenuItem key={`month-${month}`} value={month}>
                                {month}
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
                        value={linkedYearlyGoals}
                        getOptionLabel={(option) => option.title}
                        options={yearlyGoals}
                        onChange={handleLinkedYearlyGoalsChange}
                        freeSolo
                        multiple
                        renderTags={(value, props) =>
                            value.map((option, index) => (
                                <Chip label={option.title} {...props({index})} />
                            ))
                        }
                        renderInput={(params) => <TextField label="Year Goal" {...params} />}/>
                </Grid>
            </Grid>
            <Grid container style={{padding: 10}} spacing={0}>
                {
                    goalUpdate ?
                        <LoadingButton variant="contained" disabled={loading} onClick={updateMonthlyGoal}>Update
                            Goal</LoadingButton> :
                        <LoadingButton variant="contained" disabled={loading} onClick={createMonthlyGoal}>Add
                            Goal</LoadingButton>
                }
            </Grid>
        </Grid>
        <Grid item xs={12} md={5} style={{paddingRight: '2px'}}>
            <MonthlyGoalList
                setSnackbarMessage={setSnackbarMessage}
                setOpenSnackbar={setOpenSnackbar}
                listReload={listReload}
                year={year}
                month={month}
                editMonthlyGoal={editMonthlyGoal}
                deleteMonthlyGoal={deleteMonthlyGoal}/>
        </Grid>
        <Grid item xs={12} md={4}>
            <YearlyGoalList
                setSnackbarMessage={setSnackbarMessage}
                setOpenSnackbar={setOpenSnackbar}
                year={year}
                month={month}/>
        </Grid>
    </Grid>
}

export default CreateMonthlyGoal;
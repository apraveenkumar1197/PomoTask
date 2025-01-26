import * as React from "react";
import dayjs from 'dayjs';
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {LocalizationProvider, MobileDatePicker, TimePicker} from "@mui/x-date-pickers";
import {Modal, Box, Grid, Checkbox} from "@mui/material";
import {SmallOutlinedTextBox} from "../../ui/SmallOutlinedTextBox";

import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import StarRateIcon from '@mui/icons-material/StarRate';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import LightModeIcon from '@mui/icons-material/LightMode';
import {LoadingButton} from "../../ui/LoadingButton";
import Task from "../../repo/Task";
import DateUtil from "../../functionalities/DateUtil";

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    maxWidth: 600,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    '@media (max-width: 600px)': {
        width: '90%',
        height: '90%',
    },
};


function TaskModel(props) {

    const [taskId, setTaskId] = React.useState(null);
    const [taskUpdate, setTaskUpdate] = React.useState(false);

    const [taskTitle, setTaskTitle] = React.useState(null);
    const [taskAddToMyDay, setTaskAddToMyDay] = React.useState(false);
    const [taskImportant, setTaskImportant] = React.useState(false);
    const [taskDueDate, setTaskDueDate] = React.useState(dayjs());
    const [taskFromTime, setTaskFromTime] = React.useState(dayjs());
    const [taskToTime, setTaskToTime] = React.useState(dayjs());
    const [taskNotes, setTaskNotes] = React.useState(null);

    const [loading, setLoading] = React.useState(false);

    const createTask = () => {
        setLoading(true)
        Task.create(taskTitle, taskAddToMyDay, taskImportant, new DateUtil(taskDueDate).mySQLDate(), new DateUtil(taskFromTime).mySQLTime(), new DateUtil(taskToTime).mySQLTime(), taskNotes).then((res) => {
            props.setSnackbarMessage(res.data.msg)
            props.setOpenSnackbar(true)
            resetForm();
            props.setShowCreateTaskModel(false)
        }).catch((err) => {
            props.setSnackbarMessage(err.response.data.msg)
            props.setOpenSnackbar(true)
            setLoading(false)
        });
    }

    const resetForm = () => {
        setTaskId(null);
        setTaskUpdate(false);

        setTaskTitle(null);
        setTaskAddToMyDay(false);
        setTaskImportant(false);
        setTaskDueDate(dayjs());
        setTaskFromTime(dayjs());
        setTaskToTime(dayjs());
        setTaskNotes(null);

        setLoading(false)

        props.getTaskList()
    }

    const cancelCreateTask = () => {
        props.setShowCreateTaskModel(false)
        resetForm()
    }

    console.log('showCreateTaskModel :: TaskModel', props.showCreateTaskModel)

    return <Modal
        open={props.showCreateTaskModel}
        onClose={() => {
            props.setShowCreateTaskModel(false)
        }}>
        <Box sx={modalStyle} spacing={1}>
            <Grid container style={{padding: 10}}>
                <Grid item xs={12} sm={12}>
                    <SmallOutlinedTextBox label="Title" value={taskTitle}
                                          onInput={(e) => setTaskTitle(e.target.value)}/>
                </Grid>
            </Grid>
            <Grid container style={{padding: 10}}>
                <Grid item>
                    <Checkbox
                        onChange={() => {
                            setTaskImportant(true)
                        }}
                        icon={<StarBorderOutlinedIcon/>}
                        checkedIcon={<StarRateIcon/>}/>
                </Grid>
                <Grid item>
                    <Checkbox
                        onChange={() => {
                            setTaskAddToMyDay(true)
                        }}
                        icon={<LightModeOutlinedIcon/>}
                        checkedIcon={<LightModeIcon/>}/>
                </Grid>
            </Grid>
            <Grid container style={{padding: 10}}>
                <Grid item xs={12} sm={12}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <MobileDatePicker
                            label="Date"
                            inputFormat="DD/MM/YYYY"
                            onChange={(newValue) => {
                                console.log('Date', newValue)
                                setTaskDueDate(newValue);
                            }}
                            renderInput={(params) =>
                                <SmallOutlinedTextBox {...params} />
                            }
                            value={taskDueDate}/>
                    </LocalizationProvider>
                </Grid>
            </Grid>
            <Grid container>
                <Grid item style={{padding: 10}}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <TimePicker
                            label="From time"
                            value={taskFromTime}
                            onChange={(newValue) => setTaskFromTime(newValue)}/>
                    </LocalizationProvider>
                </Grid>
                <Grid item style={{padding: 10}}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <TimePicker
                            label="End time"
                            value={taskToTime}
                            onChange={(newValue) => setTaskToTime(newValue)}/>
                    </LocalizationProvider>
                </Grid>
            </Grid>
            <Grid container style={{padding: 10}} sx={{display: 'flex', justifyContent: 'flex-end'}}>
                <Grid item>
                    <LoadingButton size="small" disabled={loading} onClick={cancelCreateTask}>Cancel</LoadingButton>
                </Grid>
                <Grid item>
                    <LoadingButton variant="contained" size="large" disabled={loading} onClick={createTask}>Create
                        Task</LoadingButton>
                </Grid>
            </Grid>
        </Box>
    </Modal>
}

export default TaskModel;

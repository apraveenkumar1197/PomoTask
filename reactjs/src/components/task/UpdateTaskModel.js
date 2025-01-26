import * as React from "react";
import dayjs from 'dayjs';
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {DateTimePicker, LocalizationProvider, MobileDatePicker, TimePicker} from "@mui/x-date-pickers";
import {Modal, Box, Grid, Checkbox, Autocomplete, Chip, IconButton} from "@mui/material";
import {SmallOutlinedTextBox} from "../../ui/SmallOutlinedTextBox";

import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import StarRateIcon from '@mui/icons-material/StarRate';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import LightModeIcon from '@mui/icons-material/LightMode';
import {LoadingButton} from "../../ui/LoadingButton";
import Task from "../../repo/Task";
import DateUtil from "../../functionalities/DateUtil";
import {TextField} from '@mui/material';
import {renderTimeViewClock} from '@mui/x-date-pickers/timeViewRenderers';
import DeleteIcon from "@mui/icons-material/Delete";

// import {EditorState, convertToRaw} from 'draft-js';
// import {Editor} from 'react-draft-wysiwyg';
// import draftToHtml from 'draftjs-to-html';
// import htmlToDraft from 'html-to-draftjs';

const style = {
    position: 'absolute',
    overflow: 'scroll',
    top: '50%',
    left: '50%',
    height: '100%',
    maxHeight: 500,
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    pt: 2,
    px: 4,
    pb: 3,
};

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


export const UpdateTaskModel = (props) => {

    const [taskId, setTaskId] = React.useState(props.taskId);
    const [taskUpdate, setTaskUpdate] = React.useState(false);

    const [taskTitle, setTaskTitle] = React.useState(null);
    const [taskStatus, setTaskStatus] = React.useState(null);
    const [taskAddToMyDay, setTaskAddToMyDay] = React.useState(false);
    const [taskImportant, setTaskImportant] = React.useState(false);
    const [taskReminderDateTime, setTaskReminderDateTime] = React.useState(null);
    const [taskDueDate, setTaskDueDate] = React.useState(null);
    const [taskFromTime, setTaskFromTime] = React.useState(null);
    const [taskToTime, setTaskToTime] = React.useState(null);
    const [taskNotes, setTaskNotes] = React.useState(null);
    const [taskTags, setTaskTags] = React.useState([]);

    const [loading, setLoading] = React.useState(false);

    const handleTagsChange = (event, newValue) => {
        setTaskTags(newValue);
    }

    const editTask = () => {
        if (!props.tasksModel) return

        setLoading(true)
        Task.edit(taskId).then((res) => {
            editForm(res.data.data.task)
        }).catch((err) => {
        });
    }

    const updateTask = () => {
        setLoading(true)
        Task.update(
            taskId,
            taskTitle,
            taskStatus,
            taskAddToMyDay,
            taskImportant,
            taskDueDate != null ? new DateUtil(taskDueDate).mySQLDate() : null,
            taskFromTime != null ? new DateUtil(taskFromTime).mySQLTime() : null,
            taskToTime != null ? new DateUtil(taskToTime).mySQLTime() : null,
            taskReminderDateTime != null ? new DateUtil(taskReminderDateTime).mySQLDateTime() : null,
            taskNotes,
            taskTags
        ).then((res) => {

            console.log(res)
            if (props.setSnackbarMessage != null)
                props.setSnackbarMessage(res.data.msg)
            if (props.setOpenSnackbar != null)
                props.setOpenSnackbar(true)
            if (props.setShowTaskModel != null)
                props.setShowTaskModel(false)
            if (props.getTaskList != null)
                props.getTaskList()
            //resetForm();
        }).catch((err) => {
            console.log('Update Error ', err)
            if (props.setSnackbarMessage != null)
                props.setSnackbarMessage(err.response.data.msg)
            if (props.setOpenSnackbar != null)
                props.setOpenSnackbar(true)

        });
        setLoading(false)
    }

    const deleteTask = () => {
        Task.delete(taskId).then((res) => {
            if (props.setSnackbarMessage != null)
                props.setSnackbarMessage(res.data.msg)

            props.getTaskList()
            props.setShowTaskModel(false)

        }).catch((err) => {
            if (props.setSnackbarMessage != null)
                props.setSnackbarMessage(err.response.data.msg)
            if (props.setOpenSnackbar != null)
                props.setOpenSnackbar(true)

        });
    }

    const editForm = (taskData) => {
        setTaskTitle(taskData.title);
        setTaskAddToMyDay(taskData.is_my_day);
        setTaskImportant(taskData.is_important_flag);
        setTaskDueDate((new DateUtil(taskData.planned_date)).date);
        setTaskFromTime((new DateUtil(taskData.from_time, DateUtil.timeFormat)).date);
        setTaskToTime((new DateUtil(taskData.to_time, DateUtil.timeFormat)).date);
        setTaskReminderDateTime((new DateUtil(taskData.reminder_date_time, DateUtil.dateTimeFormat)).date);
        setTaskNotes(taskData.notes);
        setTaskTags(taskData.tags.map((tag) => tag.name));
        (taskData.tags.map((tag) => tag.name));

        setLoading(false)
    }

    const resetForm = () => {
        setTaskId(null);
        setTaskUpdate(false);

        setTaskTitle(null);
        setTaskAddToMyDay(false);
        setTaskImportant(false);
        setTaskDueDate(null);
        setTaskFromTime(null);
        setTaskToTime(null);
        setTaskNotes(null);
        setTaskReminderDateTime(null);

        setLoading(false)

        props.getTaskList()
    }

    const cancelCreateTask = () => {
        props.setShowTaskModel(false)
        //resetForm()
    }


    React.useEffect(() => {
        editTask()
    }, [props.tasksModel])

    return <Modal
        open={props.tasksModel}
        onClose={() => {
            props.setShowTaskModel(false)
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
                        checked={taskImportant}
                        onChange={() => {
                            setTaskImportant(true)
                        }}
                        icon={<StarBorderOutlinedIcon/>}
                        checkedIcon={<StarRateIcon/>}/>
                </Grid>
                <Grid item>
                    <Checkbox
                        checked={taskAddToMyDay}
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
                        <DateTimePicker
                            label="Remind me at"
                            ampm={false}
                            views={['year', 'month', 'day', 'hours', 'minutes']}
                            format="YYYY-MM-DD HH:mm"
                            value={taskReminderDateTime}
                            onChange={(newValue) => setTaskReminderDateTime(newValue)}/>
                    </LocalizationProvider>
                </Grid>
            </Grid>
            <Grid container style={{padding: 10}}>
                <Grid item xs={12} sm={12}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <MobileDatePicker
                            label="Date"
                            inputFormat="DD/MM/YYYY"
                            onChange={(newValue) => {
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
                            onChange={(newValue) => setTaskFromTime(newValue)}
                            viewRenderers={{
                                hours: renderTimeViewClock,
                                minutes: renderTimeViewClock,
                                seconds: renderTimeViewClock,
                            }}/>
                    </LocalizationProvider>
                </Grid>
                <Grid item style={{padding: 10}}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <TimePicker
                            label="End time"
                            value={taskToTime}
                            onChange={(newValue) => setTaskToTime(newValue)}
                            viewRenderers={{
                                hours: renderTimeViewClock,
                                minutes: renderTimeViewClock,
                                seconds: renderTimeViewClock,
                            }}
                        />
                    </LocalizationProvider>
                </Grid>
            </Grid>
            <Grid container style={{padding: 10}}>
                <Grid item xs={12} sm={12}>
                    <TextField
                        label="Description"
                        multiline
                        rows={4}
                        value={taskNotes}
                        onInput={(e) => setTaskNotes(e.target.value)}
                        variant="outlined"
                        fullWidth/>
                </Grid>
            </Grid>
            <Grid container style={{padding: 10}}>
                <Grid item xs={12} sm={12}>
                    <Autocomplete
                        clearIcon={false}
                        value={taskTags}
                        options={props.tagsList}
                        onChange={handleTagsChange}
                        freeSolo
                        multiple
                        renderTags={(value, props) =>
                            value.map((option, index) => (
                                <Chip label={option} {...props({index})} />
                            ))
                        }
                        renderInput={(params) => <TextField label="Tags" {...params} />}/>
                </Grid>
            </Grid>
            <Grid container style={{padding: 10}} sx={{display: 'flex', justifyContent: 'flex-end'}}>
                <Grid item>
                    <IconButton aria-label="delete" color="error" onClick={deleteTask}><DeleteIcon/></IconButton>
                </Grid>
                <Grid item>
                    <LoadingButton size="small" disabled={loading} onClick={cancelCreateTask}>Cancel</LoadingButton>
                </Grid>
                <Grid item>
                    <LoadingButton variant="contained" size="large" disabled={loading} onClick={updateTask}>Update
                        Task</LoadingButton>
                </Grid>
            </Grid>
        </Box>
    </Modal>
}

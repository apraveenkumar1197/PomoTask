import 'smart-webcomponents-react/source/styles/smart.default.css';
import React from "react";

import {Scheduler} from "@aldabil/react-scheduler";
import Task from "../../repo/Task";
import Box from "@mui/material/Box";
import {Grid, Slider} from "@mui/material";
import DateUtil from "../../functionalities/DateUtil";

const sliderMarks = [
    {
        value: 5,
        label: '5m',
    },
    {
        value: 15,
        label: '15m',
    },
    {
        value: 30,
        label: '30m',
    },
    {
        value: 60,
        label: '1H',
    },
    {
        value: 120,
        label: '2H',
    },
];

export const TaskCalendar = (props) => {

    const [eventsList, setEventsList] = React.useState([])
    const [loading, setLoading] = React.useState(false)
    const [startHour, setStartHour] = React.useState(9)
    const [endHour, setEndHour] = React.useState(22)
    const [steps, setSteps] = React.useState(60)
    const [showTaskModel, setShowTaskModel] = React.useState(true);

    const onSelectedDateChange = (e) => {
        console.log('onSelectedDateChange', e)
    }
    const getRemoteEvents = (e) => {
        console.log('getRemoteEvents', e)
    }
    const onConfirm = (event, action) => {
        if (action === 'create') {
            Task.create(
                event.title,
                false,
                false,
                new DateUtil(event.start).mySQLDate(),
                new DateUtil(event.start).mySQLTime(),
                new DateUtil(event.end).mySQLTime(),
                null
            ).then((res) => {
                props.setSnackbarMessage(res.data.msg)
                props.setOpenSnackbar(true)
                getTaskList();
            }).catch((err) => {
                props.setSnackbarMessage(err.response.data.msg)
                props.setOpenSnackbar(true)
            });
        } else {
            Task.update(
                event.event_id,
                event.title,
                null,
                null,
                null,
                new DateUtil(event.start).mySQLDate(),
                new DateUtil(event.start).mySQLTime(),
                new DateUtil(event.end).mySQLTime(),
                null,
                null,
                null
            ).then((res) => {
                props.setSnackbarMessage(res.data.msg)
                props.setOpenSnackbar(true)
                getTaskList();
            }).catch((err) => {
                props.setSnackbarMessage(err.response.data.msg)
                props.setOpenSnackbar(true)
            });
        }

        return new Promise((res, rej) => {
            res({
                ...event,
                event_id: event.event_id || Math.random()
            });
        });
    }

    const getTaskList = () => {
        setLoading(true)

        Task.calendarTaskList().then((res) => {
            let tasks = res.data.data.tasks
            let startHours = []
            let endHours = []
            tasks = tasks.map((task, index) => {
                let startDatetime = new Date(task.start)
                let endDatetime = new Date(task.end)
                task.start = startDatetime
                task.end = endDatetime

                startHours.push(startDatetime.getHours())
                endHours.push(endDatetime.getHours())

                return task
            })

            console.log('End hours :: ', endHours)
            console.log('End hours :: ', Math.max(...endHours))

            setStartHour(Math.min(...startHours) - 2)
            setEndHour(Math.max(...endHours) + 2)
            setEventsList(tasks)

            setLoading(false)
        }).catch((err) => {
            console.log(err)
            props.setSnackbarMessage(err.response.data.msg)
            props.setOpenSnackbar(true)
            setLoading(false)
        });
    }

    const handleEventDrop = async  (droppedEvent, fromDateTime, event) => {

        Task.update(
            event.event_id,
            null,
            null,
            null,
            null,
            new DateUtil(event.start).mySQLDate(),
            new DateUtil(event.start).mySQLTime(),
            new DateUtil(event.end).mySQLTime(),
            null,
            null,
            null
        ).then((res) => {
            props.setSnackbarMessage(res.data.msg)
            props.setOpenSnackbar(true)
            getTaskList();
        }).catch((err) => {
            props.setSnackbarMessage(err.response.data.msg)
            props.setOpenSnackbar(true)
        });
    };

    React.useEffect(() => {
        getTaskList()
    }, [])


    return <Box sx={{minWidth: 275}}>
        <Grid container>
            <Grid item xs={4} sm={4}>
                <Slider
                    aria-label="Steps"
                    defaultValue={60}
                    valueLabelDisplay="auto"
                    step={null}
                    value={steps}
                    onChange={(event, newValue) => {
                        setSteps(newValue)
                    }}
                    marks={sliderMarks}
                />
            </Grid>
        </Grid>
        <Grid container>
            <Grid item xs={12} sm={12}>
                <Scheduler
                    draggable={true}
                    /*customEditor={(scheduler) =>
                        <UpdateTaskModel taskId={scheduler.state.event_id.value}
                                         tasksModel={showTaskModel}
                                         setTasksModel={setShowTaskModel}/>
                    }*/
                    day={
                        {
                            startHour: startHour,
                            endHour: endHour,
                            step: steps,
                            navigation: true
                        }
                    }
                    week={
                        {
                            weekDays: [0, 1, 2, 3, 4, 5, 6],
                            weekStartOn: 1,
                            startHour: startHour,
                            endHour: endHour,
                            step: steps,
                            navigation: true,
                            disableGoToDay: false
                        }
                    }
                    month={
                        {
                            weekDays: [0, 1, 2, 3, 4, 5, 6],
                            weekStartOn: 1,
                            startHour: startHour,
                            endHour: endHour,
                            step: steps,
                            navigation: true,
                            disableGoToDay: false
                        }
                    }
                    onSelectedDateChange={onSelectedDateChange}
                    getRemoteEvents={getRemoteEvents}
                    view="week"
                    events={eventsList}
                    loading={loading}
                    editable={true}
                    deletable={false}
                    onConfirm={onConfirm}
                    onEventDrop={handleEventDrop}/>
            </Grid>
        </Grid>
    </Box>
}



import React from 'react';
import {Fab, Grid, IconButton, Paper, TextField} from '@mui/material';
import Task from "../../repo/Task";
import AddIcon from "@mui/icons-material/Add";

const TaskAdd = (props) => {

    const [addTaskTitle, setAddTaskTitle] = React.useState('');


    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            createTask()
        }
    }

    const createTask = () => {
        if (addTaskTitle.trim() === '') return

        Task.create(addTaskTitle).then((res) => {
            props.setSnackbarMessage(res.data.msg)
            props.setOpenSnackbar(true)
            resetForm();
        }).catch((err) => {
            props.setSnackbarMessage(err.response.data.msg)
            props.setOpenSnackbar(true)
        });
    }

    const resetForm = () => {
        setAddTaskTitle('');
        console.log('taskTitle', addTaskTitle)
        props.getTaskList();
    }

    console.log('showCreateTaskModel', props.showCreateTaskModel)

    return (
        <div>
            <Grid container style={{
                position: 'fixed',
                bottom: 0
            }}>
                {/*<Grid item>
                    <Fab color="primary" aria-label="add" onClick={() => {
                        props.setShowCreateTaskModel(false)
                    }}>
                        <AddIcon/>
                    </Fab>
                </Grid>*/}
                <Grid item style={{width: '90%'}}>
                    <Paper>
                        <TextField
                            fullWidth
                            placeholder="Add Task"
                            variant="outlined"
                            value={addTaskTitle}
                            onChange={(e) => setAddTaskTitle(e.target.value)}
                            onKeyDown={handleKeyPress}/>
                    </Paper>
                </Grid>

            </Grid>
        </div>
    );
};

export default TaskAdd;
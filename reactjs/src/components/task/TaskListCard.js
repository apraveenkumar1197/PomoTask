import { useTheme } from '@mui/material/styles';
import Box from "@mui/material/Box";
import {
    Checkbox,
    Grid,
    IconButton,
    InputLabel,
    Chip,
} from "@mui/material";
import * as React from "react";
import {styled} from "@mui/system";
import CardContent from "@mui/material/CardContent";
import StarBorderOutlinedIcon from "@mui/icons-material/StarBorderOutlined";
import StarRateIcon from "@mui/icons-material/StarRate";
import Task from "../../repo/Task";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {UpdateTaskModel} from "./UpdateTaskModel";

const HoverCardContent = styled(CardContent)(({theme}) => ({
    transition: 'transform 0.3s, box-shadow 0.3s',
    backgroundColor: '#ffffff',
    '&:hover': {
        backgroundColor: '#f0f0f0'
    },
}));

export const TaskListCard = (props) => {
    var taskId = props.task.id;

    const [taskImportant, SetTaskImportant] = React.useState(props.task.is_important_flag);
    const [taskStatus, SetTaskStatus] = React.useState(props.task.status_bool);
    const [showTaskModel, setShowTaskModel] = React.useState(false);


    const updateTaskStatus = () => {
        Task.update(taskId, null, !taskStatus ? '1' : null, null, null).then((res) => {
            props.setSnackbarMessage(res.data.msg)
            props.setOpenSnackbar(true)
            props.getTaskList()
        }).catch((err) => {
            props.setSnackbarMessage(err.response.data.msg)
            props.setOpenSnackbar(true)
        });
    }

    const updateTaskImportantFlag = () => {
        Task.update(taskId, null, null, null, !taskImportant).then((res) => {
            props.setSnackbarMessage(res.data.msg)
            props.setOpenSnackbar(true)
            props.getTaskList()
        }).catch((err) => {
            props.setSnackbarMessage(err.response.data.msg)
            props.setOpenSnackbar(true)
        });
    }

    const showUpdateTaskModel = () => {
        setShowTaskModel(true)
    }

    const filterTags = () => {

    }

    return <React.Fragment>
        {/*<TableRow>
                <TableCell>
                    <IconButton aria-label="delete" onClick={showUpdateTaskModel}>
                        <OpenInNewIcon/>
                    </IconButton>
                </TableCell>
                <TableCell>
                    <Checkbox
                        checked={false}
                        name="basicCheckbox"
                        color="primary"
                        onChange={(e) => {
                            SetTaskStatus(e.target.checked)
                            updateTaskStatus()
                        }}/>
                </TableCell>
                <TableCell>
                    <Checkbox
                        checked={taskImportant}
                        onChange={(e) => {
                            SetTaskImportant(e.target.checked)
                            updateTaskImportantFlag()
                        }}
                        icon={<StarBorderOutlinedIcon/>}
                        checkedIcon={<StarRateIcon/>}/>
                </TableCell>
                <TableCell>
                    <InputLabel className='list-task-title'>{props.task.title}</InputLabel>
                </TableCell>
                <TableCell>
                    {props.task.is_my_day ? <InputLabel className='list-task-flags'>My Day</InputLabel> :
                        <div></div>
                    }
                </TableCell>
                <TableCell>
                    {props.task.is_important_flag ?
                        <InputLabel className='list-task-flags'>Important</InputLabel> : <div></div>
                    }
                </TableCell>
            </TableRow>*/}
        <HoverCardContent style={{padding: '6px'}}>
            <Box sx={{bgolor: 'white'}}>
                <Grid container>
                    <Grid item sx={{paddingRight: '20px'}}>
                        <IconButton aria-label="delete" onClick={showUpdateTaskModel}>
                            <OpenInNewIcon/>
                        </IconButton>
                    </Grid>
                    <Grid item sx={{paddingRight: '20px'}}>
                        <Checkbox
                            checked={false}
                            name="basicCheckbox"
                            color="primary"
                            onChange={(e) => {
                                SetTaskStatus(e.target.checked)
                                updateTaskStatus()
                            }}/>
                    </Grid>
                    <Grid item sx={{paddingRight: '20px'}}>
                        <Grid container>
                            <Checkbox
                                checked={taskImportant}
                                onChange={(e) => {
                                    SetTaskImportant(e.target.checked)
                                    updateTaskImportantFlag()
                                }}
                                icon={<StarBorderOutlinedIcon/>}
                                checkedIcon={<StarRateIcon/>}/>
                        </Grid>
                    </Grid>
                    <Grid item>
                        <Grid container>
                            <Grid item xs={12} md={12} style={{wordWrap: 'normal'}}>
                                <InputLabel className='list-task-title'>{props.task.title}</InputLabel>
                            </Grid>
                        </Grid>
                        <Grid container alignItems="center">
                            <Grid item>
                                {props.task.is_my_day ? <InputLabel className='list-task-flags'>My Day</InputLabel> :
                                    <div></div>
                                }
                            </Grid>
                            <Grid item>
                                {props.task.planned_date != null ?
                                    <InputLabel className='list-task-flags'>{props.task.planned_date}</InputLabel> :
                                    <div></div>
                                }
                            </Grid>
                            <Grid item>
                                {props.task.from_time != null ?
                                    <InputLabel className='list-task-flags'>{props.task.from_time}</InputLabel> :
                                    <div></div>
                                }
                            </Grid>
                            <Grid item>
                                {props.task.from_time != null ?
                                    <InputLabel className='list-task-flags'>{props.task.estimate_text}</InputLabel> :
                                    <div></div>
                                }
                            </Grid>
                            {
                                props.task.tags.map((tag, i) => (
                                    <Grid item style={{paddingRight: '2px'}}>
                                        <Chip size="small" label={tag.name} onClick={filterTags}/>
                                    </Grid>
                                ))
                            }
                        </Grid>
                    </Grid>
                </Grid>
            </Box>
            <UpdateTaskModel
                taskId={props.task.id}
                tagsList={props.tagsList}
                getTaskList={props.getTaskList}
                tasksModel={showTaskModel}
                setShowTaskModel={setShowTaskModel}
                setSnackbarMessage={props.setSnackbarMessage}
                setOpenSnackbar={props.setOpenSnackbar}
                onClose={() => setShowTaskModel(false)}/>
        </HoverCardContent>
    </React.Fragment>
}
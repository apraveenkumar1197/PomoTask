import * as React from "react";
import Box from '@mui/material/Box';
import {
    Checkbox, Fab,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Select,
} from "@mui/material";

import Task from "../../repo/Task";
import {TaskListCard} from "./TaskListCard";
import TaskAdd from "./TaskAdd";
import ListItemText from "@mui/material/ListItemText";
import TaskModel from "./TaskModel";

function TaskList(props) {

    const [showTaskModel, setShowTaskModel] = React.useState(false);
    const [showCreateTaskModel, setShowCreateTaskModel] = React.useState(false);
    const [taskList, setTaskList] = React.useState([]);
    const [tagsList, setTagsList] = React.useState([]);
    const [loading, setLoading] = React.useState(false);

    const [filteredTags, setFilteredTags] = React.useState([]);

    const getTaskList = () => {
        setLoading(true)
        Task.list(props.filterList, filteredTags).then((res) => {
            setTaskList(res.data.data.tasks)
            setTagsList(res.data.data.tags)
            setLoading(false)
        }).catch((err) => {
            props.setSnackbarMessage(err.response.data.msg)
            props.setOpenSnackbar(true)
            setLoading(false)
        });
    }

    const handleFilterTagsSelectChange = (event) => {
        const {
            target: {value},
        } = event;
        setFilteredTags(
            typeof value === 'string' ? value.split(',') : value,
        );
    }

    console.log('showCreateTaskModel :: Task list', showCreateTaskModel)

    React.useEffect(() => {
        getTaskList()
    }, [props.filterList, filteredTags]);

    /* return (
         <Box sx={{minWidth: 275}}>
             <Box sx={{maxHeight: '75vh', overflowY: 'auto', p: 2}}>
                 <Table flex={1}>
                     <TableHead style={{backgroundColor: '#1976d2'}}>
                         <TableRow>
                             <TableCell></TableCell>
                             <TableCell></TableCell>
                             <TableCell></TableCell>
                             <TableCell>Title</TableCell>
                         </TableRow>
                     </TableHead>
                     <TableBody>
                         {taskList.map((task, i) => (
                             <TaskListCard variant="outlined" task={task} getTaskList={getTaskList}
                                           setSnackbarMessage={props.setSnackbarMessage}
                                           setOpenSnackbar={props.setOpenSnackbar}/>
                         ))}
                     </TableBody>
                 </Table>
                 <TaskAdd getTaskList={getTaskList} setSnackbarMessage={props.setSnackbarMessage}
                              setOpenSnackbar={props.setOpenSnackbar}/>
             </Box>
             <Grid container>
                 <Grid item xs={12} sm={12}>

                 </Grid>
             </Grid>
         </Box>
     );*/

    console.log('Task list :: showCreateTaskModel', showCreateTaskModel)

    return <Box sx={{'& > :not(style)': {m: 1}}}>
        <Grid container style={{paddingBottom: '2px'}}>
            <Grid item xs={12} sm={12}>
                <FormControl sx={{m: 1, width: 300}}>
                    <InputLabel id="demo-multiple-checkbox-label">Tag</InputLabel>
                    <Select
                        onChange={handleFilterTagsSelectChange}
                        labelId="demo-multiple-checkbox-label"
                        id="demo-multiple-checkbox"
                        multiple
                        value={filteredTags}
                        input={<OutlinedInput label="Tag"/>}
                        renderValue={(selected) => selected.join(', ')}>
                        {tagsList.map((name) => (
                            <MenuItem key={name} value={name}>
                                <Checkbox checked={filteredTags.includes(name)}/>
                                <ListItemText primary={name}/>
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
        </Grid>
        <Box sx={{maxHeight: '75vh', overflowY: 'auto', p: 2}} style={{backgroundColor: '#1976d2'}}>
            {/*<Grid container>
                <Grid item>
                    <Select
                        labelId="demo-multiple-checkbox-label"
                        id="demo-multiple-checkbox"
                        multiple
                        value={personName}
                        input={<OutlinedInput label="Tag"/>}
                        renderValue={(selected) => selected.join(', ')}
                        MenuProps={MenuProps}>
                        {names.map((name) => (
                            <MenuItem
                                key={name}
                                value={name}
                                style={getStyles(name, personName, theme)}>
                                {name}
                            </MenuItem>
                        ))}
                    </Select>
                </Grid>
            </Grid>*/}
            {taskList.map((task, i) => (
                <Grid container key={`task-card-item-${task.id}`} style={{paddingBottom: '2px'}}>
                    <Grid item xs={12} sm={12} key={`task-grid-${i}`}>
                        <TaskListCard key={`task-list-card-${i}`}
                                      variant="outlined"
                                      task={task}
                                      tagsList={tagsList}
                                      getTaskList={getTaskList}
                                      setShowCreateTaskModel={setShowCreateTaskModel}
                                      setSnackbarMessage={props.setSnackbarMessage}
                                      setOpenSnackbar={props.setOpenSnackbar}/>
                    </Grid>
                </Grid>
            ))}
        </Box>
        <Grid container>
            <TaskAdd
                setShowCreateTaskModel={setShowCreateTaskModel}
                getTaskList={getTaskList}
                setSnackbarMessage={props.setSnackbarMessage}
                setOpenSnackbar={props.setOpenSnackbar}/>
        </Grid>
        <TaskModel
            setSnackbarMessage={props.setSnackbarMessage}
            setOpenSnackbar={props.setOpenSnackbar}
            setShowCreateTaskModel={setShowCreateTaskModel}
            showCreateTaskModel={showCreateTaskModel}/>
    </Box>
}

export default TaskList;
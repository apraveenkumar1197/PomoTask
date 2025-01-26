import {Box, Grid} from "@mui/material";
import LeftSideNav from "./LeftSideNav";
import React from "react";
import TaskList from "./TaskList";


function TaskHome(props) {
    const [filterList, setFilterList] = React.useState(null);

    return <Box sx={{flexGrow: 1, p: 2}}>
        <Grid container spacing={2}>
            <Grid item xs={2} sm={2} md={2} lg={2}>
                <LeftSideNav
                    filterList={filterList}
                    setFilterList={setFilterList}
                    setSnackbarMessage={props.setSnackbarMessage}
                    setOpenSnackbar={props.setOpenSnackbar}/>
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={10}>
                <TaskList
                    filterList={filterList}
                    setSnackbarMessage={props.setSnackbarMessage}
                    setOpenSnackbar={props.setOpenSnackbar}/>
            </Grid>
        </Grid>
    </Box>
}

export default TaskHome;
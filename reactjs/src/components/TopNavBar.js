import * as React from 'react';
import Box from '@mui/material/Box';
import {AppBar, IconButton, Toolbar, Typography} from "@mui/material";
import {RoutePath} from "../constants/RoutePath"
import {useLocation, useNavigate} from "react-router-dom";
import DashboardIcon from '@mui/icons-material/Dashboard';
import FlagIcon from '@mui/icons-material/Flag';
import TaskIcon from '@mui/icons-material/Task';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';


function TopNavBar() {

    const navigate = useNavigate();
    const location = useLocation();
    if(location.pathname === RoutePath.Login){
        return;
    }

    const navigatePage = (path) => {
        navigate(path, {replace: true})
    };

    return  <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
            <Toolbar variant="dense">
                <Typography variant="h6" color="inherit" component="div">

                </Typography>
                <div style={{marginLeft: 'auto'}}>
                    <IconButton color="inherit" onClick={() => navigatePage(RoutePath.Dashi)}>
                        <DashboardIcon />
                    </IconButton>
                    <IconButton color="inherit"  onClick={() => navigatePage(RoutePath.GoalHome)}>
                        <FlagIcon />
                    </IconButton>
                    <IconButton color="inherit"  onClick={() => navigatePage(RoutePath.Tasks)}>
                        <TaskIcon />
                    </IconButton>
                    <IconButton color="inherit"  onClick={() => navigatePage(RoutePath.Calendar)}>
                        <CalendarMonthIcon />
                    </IconButton>
                    <IconButton color="inherit"  onClick={() => navigatePage(RoutePath.Pomodoro)}>
                        <WatchLaterIcon />
                    </IconButton>
                </div>
            </Toolbar>
        </AppBar>
    </Box>
}

export default TopNavBar;
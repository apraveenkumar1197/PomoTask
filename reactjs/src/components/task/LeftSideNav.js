import * as React from 'react';
import {
    Box,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
    useMediaQuery,
    IconButton
} from "@mui/material";
import StarIcon from '@mui/icons-material/Star';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import CottageOutlinedIcon from '@mui/icons-material/CottageOutlined';
import ViewColumnOutlinedIcon from '@mui/icons-material/ViewColumnOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from "@mui/material/Drawer";
import {useTheme} from '@mui/material/styles';

const drawerWidth = 240;

function LeftSideNav(props) {

    const [myDaySelected, setMyDaySelected] = React.useState(false);
    const [importantSelected, setImportantSelected] = React.useState(false);
    const [plannedSelected, setPlannedSelected] = React.useState(false);
    const [tasksSelected, setTasksSelected] = React.useState(true);

    const resetListItmSelection = () => {
        setMyDaySelected(false)
        setImportantSelected(false)
        setPlannedSelected(false)
        setTasksSelected(false)
    }

    const [mobileOpen, setMobileOpen] = React.useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    return <div>
        <Box sx={{flexGrow: 1, p: 2}}>
            {
                isMobile ? <IconButton>
                    <MenuIcon/>
                </IconButton> : ''
            }
            <Drawer
                variant={isMobile ? "temporary" : "permanent"}
                open={isMobile ? mobileOpen : true}
                onClose={handleDrawerToggle}
                ModalProps={{
                    keepMounted: true, // Better open performance on mobile
                }}
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                    },
                }}>
                <List>
                    <ListItemButton
                        selected={myDaySelected}
                        onClick={() => {
                            resetListItmSelection();
                            setMyDaySelected(true)
                            props.setFilterList('my_day')
                        }}>
                        <ListItemIcon>
                            <LightModeOutlinedIcon/>
                        </ListItemIcon>
                        <ListItemText primary='My Day'/>
                    </ListItemButton>
                    <ListItemButton
                        selected={importantSelected}
                        onClick={() => {
                            resetListItmSelection();
                            setImportantSelected(true)
                            props.setFilterList('important')
                        }}>
                        <ListItemIcon>
                            <StarIcon/>
                        </ListItemIcon>
                        <ListItemText primary='Important'/>
                    </ListItemButton>
                    <ListItemButton
                        selected={plannedSelected}
                        onClick={() => {
                            resetListItmSelection();
                            setPlannedSelected(true)
                            props.setFilterList('planned')
                        }}>
                        <ListItemIcon>
                            <ViewColumnOutlinedIcon/>
                        </ListItemIcon>
                        <ListItemText primary='Planned'/>
                    </ListItemButton>
                    <ListItemButton
                        selected={tasksSelected}
                        onClick={() => {
                            resetListItmSelection();
                            setTasksSelected(true)
                            props.setFilterList(null)
                        }}>
                        <ListItemIcon>
                            <CottageOutlinedIcon/>
                        </ListItemIcon>
                        <ListItemText primary='Tasks'/>
                    </ListItemButton>
                    <Divider/>
                </List>
            </Drawer>
        </Box>
    </div>
}

export default LeftSideNav;
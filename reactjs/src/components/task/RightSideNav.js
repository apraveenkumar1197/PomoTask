import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import {AppBar, IconButton, Toolbar} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";


function LeftSideNav() {
    const [state, setState] = React.useState({
        top: false,
        left: false,
        bottom: false,
        right: false,
    });

    const toggleDrawer = (anchor, open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }

        setState({...state, [anchor]: open});
    };

    const list = (anchor) => (
        <Box
            sx={{width: anchor === 'top' || anchor === 'bottom' ? 'auto' : 250}}
            role="presentation">

            <List>
                <ListItem disablePadding>
                    <ListItemButton>
                        <ListItemText primary={'My Day'}/>
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton>
                        <ListItemText primary={'Important'}/>
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton>
                        <ListItemText primary={'Planned'}/>
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton>
                        <ListItemText primary={'Tasks'}/>
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );


    React.useEffect(()=> {
        toggleDrawer('left', true)
    })

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar variant="dense">
                    <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
                        <MenuIcon onClick={toggleDrawer('left', true)}></MenuIcon>
                        <Drawer
                            sx={{
                                flexShrink: 0,
                                '& .MuiDrawer-paper': {
                                    width: 800,
                                    boxSizing: 'border-box',
                                },
                            }}
                            anchor={'left'}
                            open={state['left']}>
                            {list('left')}
                        </Drawer>
                    </IconButton>
                </Toolbar>
            </AppBar>
        </Box>
    );
}

export default LeftSideNav;
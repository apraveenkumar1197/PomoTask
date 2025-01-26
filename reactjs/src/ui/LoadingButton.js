import {Button, CircularProgress} from "@mui/material";
import Box from "@mui/material/Box";
import React from "react";

export const LoadingButton = (props) => {
    console.log('Loading button Props :: ',props);
    return <Box sx={{m: 1, position: 'relative'}}>
        <Button variant={props.variant} size={props.size} disabled={props.disabled} onClick={props.onClick}>{props.children}</Button>
        {props.disabled && (
            <CircularProgress
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    marginTop: '-12px',
                    marginLeft: '-12px',
                }}
                size={24}/>
        )}
    </Box>
}
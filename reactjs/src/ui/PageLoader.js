import {CircularProgress, LinearProgress} from "@mui/material";
import React from "react";


export const PageLoader = () => {

    return <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '80px'
    }}>
        <CircularProgress/>
    </div>
}
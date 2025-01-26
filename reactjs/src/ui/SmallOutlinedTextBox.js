import {TextField} from "@mui/material";

export const SmallOutlinedTextBox = (props) => {
    return <TextField
        id={props.id}
        label={props.label}
        onInput={props.onInput}
        value={props.value}
        variant="outlined"
        size="small"
        InputLabelProps={{
            shrink: true,
        }}
        fullWidth/>
}
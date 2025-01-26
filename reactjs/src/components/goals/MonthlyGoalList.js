import React from "react";
import Goal from "../../repo/Goal";
import {Checkbox, IconButton, Table, TableBody, TableCell, TableHead, TableRow} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

function MonthlyGoalList({
                             setSnackbarMessage,
                             setOpenSnackbar,
                             listReload,
                             year,
                             month,
                             editMonthlyGoal,
                             deleteMonthlyGoal
                         }) {

    const [goalsList, setGoalsList] = React.useState([])
    const [loading, setLoading] = React.useState(false)

    const getGoalList = () => {
        Goal.listByYearAndMonth(year, month).then((res) => {
            setGoalsList(res.data.data.goals)
            setLoading(false)
        }).catch((err) => {
            setSnackbarMessage(err.response.data.msg)
            setOpenSnackbar(true)
            setLoading(false)
        });
    }

    const updateStatus = (goalId, status) => {
        Goal.updateYearlyGoalStatus(goalId, status).then((res) => {
            setSnackbarMessage(res.data.msg)
            setOpenSnackbar(true)
            getGoalList()
        }).catch((err) => {
            setSnackbarMessage(err.response.data.msg)
            setOpenSnackbar(true)
        });
    }

    React.useEffect(() => {
        getGoalList()
    }, [listReload]);

    return <Table flex={1}>
        <TableHead className='table-header'>
            <TableRow>
                <TableCell className='table-header-font'>S.No</TableCell>
                <TableCell className='table-header-font'></TableCell>
                <TableCell className='table-header-font'>Title</TableCell>
                <TableCell className='table-header-font'></TableCell>
                <TableCell className='table-header-font'></TableCell>
            </TableRow>
        </TableHead>
        <TableBody>
            {goalsList.map((goal, i) => (
                <TableRow>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell><Checkbox checked={goal.status_bool}
                                         onChange={(e) => updateStatus(goal.id, e.target.checked ? '1' : '0')}/></TableCell>
                    <TableCell>{goal.title}</TableCell>
                    <TableCell>
                        {editMonthlyGoal ?
                            <IconButton color="black" size="medium" onClick={() => editMonthlyGoal(goal)}>
                                <EditIcon/>
                            </IconButton> : ''}
                    </TableCell>
                    <TableCell>
                        {deleteMonthlyGoal ?
                            <IconButton color="black" size="medium" onClick={() => deleteMonthlyGoal(goal)}>
                                <DeleteIcon/>
                            </IconButton> : ''}
                    </TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
}

export default MonthlyGoalList;
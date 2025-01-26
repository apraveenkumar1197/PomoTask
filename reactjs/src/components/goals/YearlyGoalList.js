import React from "react";
import {
    Checkbox, Chip,
    IconButton, keyframes,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Goal from "../../repo/Goal";

function YearlyGoalList({
                            year,
                            setSnackbarMessage,
                            setOpenSnackbar,
                            listReload,
                            editYearlyGoal,
                            deleteGoal,
                            month
                        }) {

    const [goalsList, setGoalsList] = React.useState([])
    const [loading, setLoading] = React.useState(false)

    const getGoalList = () => {
        Goal.listByYear(year).then((res) => {
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
    }, [year, listReload]);

    return <Table flex={1}>
        <TableHead className='table-header-yearly-goals'>
            <TableRow>
                <TableCell className='table-header-font'>S.No</TableCell>
                <TableCell className='table-header-font'></TableCell>
                <TableCell className='table-header-font'>Title</TableCell>
                <TableCell className='table-header-font'>Months</TableCell>
                <TableCell className='table-header-font'></TableCell>
                <TableCell className='table-header-font'></TableCell>
            </TableRow>
        </TableHead>
        <TableBody>
            {goalsList.map((goal, i) => (
                <TableRow className={goal.months.includes(month) ? 'blink-box' : ''}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell><Checkbox checked={goal.status_bool}
                                         onChange={(e) => updateStatus(goal.id, e.target.checked ? '1' : '0')}/></TableCell>
                    <TableCell>{goal.title}</TableCell>
                    <TableCell>{goal.months.map((month) => <Chip label={month}/>)}</TableCell>
                    <TableCell>
                        {
                            editYearlyGoal ?
                                <IconButton color="black" size="medium" onClick={() => editYearlyGoal(goal)}>
                                    <EditIcon/>
                                </IconButton> : ''
                        }
                    </TableCell>
                    <TableCell>
                        {
                            deleteGoal ? <IconButton color="black" size="medium" onClick={() => deleteGoal(goal)}>
                                <DeleteIcon/>
                            </IconButton> : ''
                        }
                    </TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
}

export default YearlyGoalList;
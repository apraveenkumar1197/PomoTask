import './App.css';
import './pomodoro.css';
import React, {useEffect} from 'react'
import {Snackbar} from "@mui/material";
import TaskHome from "./components/task/TaskHome";
import {Routes, Route} from "react-router-dom";
import {RoutePath} from "./constants/RoutePath"
import {TaskCalendar} from "./components/calendar/calendar";
import {Index} from "./components/Index";
import Pomodoro from "./components/pomodoro/Pomodoro";
import {CreateYearlyGoal} from "./components/goals/CreateYearlyGoal";
import CreateMonthlyGoal from "./components/goals/CreateMonthlyGoal";
import GoalsHome from "./components/goals/GoalsHome";
import Dashi from "./components/Dashi";
import TopNavBar from "./components/TopNavBar";
import Box from "@mui/material/Box";
import OneSignal from "react-onesignal";

function App() {
    const [snackbarMessage, setSnackbarMessage] = React.useState('')
    const [openSnackbar, setOpenSnackbar] = React.useState(false)

    return <div>
        <Snackbar
            onClose={() => setOpenSnackbar(false)}
            open={openSnackbar}
            autoHideDuration={6000}
            message={snackbarMessage !== '' ? snackbarMessage : 'Unknown server error'}/>
        {/*<Register setSnackbarMessage={setSnackbarMessage} setOpenSnackbar={setOpenSnackbar}/>*/}
        <Box sx={{flexGrow: 1}}>
              <TopNavBar />
          </Box>
        <br/>
        <div>
            <Routes>
                <Route path={RoutePath.RootPath} element={<Index setSnackbarMessage={setSnackbarMessage}
                                                                 setOpenSnackbar={setOpenSnackbar}/>}></Route>
                <Route path={RoutePath.Dashi} element={<Dashi setSnackbarMessage={setSnackbarMessage}
                                                                 setOpenSnackbar={setOpenSnackbar}/>}></Route>
                <Route path={RoutePath.Tasks} element={<TaskHome setSnackbarMessage={setSnackbarMessage}
                                                                 setOpenSnackbar={setOpenSnackbar}/>}></Route>
                <Route path={RoutePath.Calendar} element={<TaskCalendar setSnackbarMessage={setSnackbarMessage}
                                                                        setOpenSnackbar={setOpenSnackbar}/>}></Route>
                <Route path={RoutePath.Pomodoro} element={<Pomodoro setSnackbarMessage={setSnackbarMessage}
                                                                    setOpenSnackbar={setOpenSnackbar}/>}></Route>
                <Route path={RoutePath.GoalYear} element={<CreateYearlyGoal setSnackbarMessage={setSnackbarMessage}
                                                                    setOpenSnackbar={setOpenSnackbar}/>}></Route>
                <Route path={RoutePath.GoalMonth} element={<CreateMonthlyGoal setSnackbarMessage={setSnackbarMessage}
                                                                    setOpenSnackbar={setOpenSnackbar}/>}></Route>
                <Route path={RoutePath.GoalHome} element={<GoalsHome setSnackbarMessage={setSnackbarMessage}
                                                                    setOpenSnackbar={setOpenSnackbar}/>}></Route>
            </Routes>
        </div>
    </div>
}


/*function App() {
  const [snackbarMessage, setSnackbarMessage] = React.useState('')
  const [openSnackbar, setOpenSnackbar] = React.useState(false)

  const navigate = useNavigate();
  const location = useLocation();
  if(location.pathname !== RoutePath.Login){
    if (LocalStorage.accessToken() === null) {
      navigate('/login', {replace: true})
    }
  }

  return (
      <div>
        <Snackbar
            onClose={() => setOpenSnackbar(false)}
            open={openSnackbar}
            autoHideDuration={6000}
            message={snackbarMessage !== '' ? snackbarMessage : 'Unknown server error'}/>
        {/!*<Register setSnackbarMessage={setSnackbarMessage} setOpenSnackbar={setOpenSnackbar}/>*!/}
        <br/>
        <div>
          <Routes>
            {/!*<Route path={RoutePath.RootPath} element={<Index setSnackbarMessage={setSnackbarMessage} setOpenSnackbar={setOpenSnackbar}/>}></Route>*!/}

          </Routes>
        </div>
      </div>


  );
}*/

export default App;

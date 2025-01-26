import {useNavigate} from "react-router-dom";
import {useEffect} from "react";
import {RoutePath} from "../constants/RoutePath";
import OneSignal from 'react-onesignal';


export const Index = (props) => {
    const navigate = useNavigate();
    useEffect(() => {
        navigate(RoutePath.Tasks, {replace: true})
    });
}
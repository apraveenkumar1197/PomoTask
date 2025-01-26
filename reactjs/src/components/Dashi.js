import React from "react";
import {Grid} from "@mui/material";
import {PieChart} from '@mui/x-charts/PieChart';

function Dashi() {

    return <PieChart
        series={[
            {
                arcLabel: (item) => `${item.value}%`,
                arcLabelMinAngle: 5,
                arcLabelRadius: '60%',
                data: [
                    {id: 0, value: 30, label: 'Un Planned', color: '#8796fa'},
                    {id: 1, value: 70, label: 'Planned', color: '#8cfa84'},
                ],
            },
        ]}
        width={400}
        height={200}
    />
}

export default Dashi;
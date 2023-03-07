import React from "react";
import ExplainGraphs from "../d3/ExplainGraph";
import { getDatasets} from '../service/dataService';
import {ProcessHetergraph} from "./ProcessHetergraph";
import AceEditor from "react-ace"
import { Button, Grid,Box,TextField, Typography,FormControl,InputLabel,Select,MenuItem,Slider,Input,Alert, CircularProgress, AlertTitle } from '@mui/material';
import { function_text } from "./texts";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools";

var d3 = require("d3");

export interface IProps {

}


export interface IState {
    datasets: string
}

export default class Page1 extends React.Component <IProps,IState>
{
    constructor(props:any)
    {
        super(props);
        this.state = {
            datasets : 'None'
        }
    }
    async getInitDatasets(){
        let res = await getDatasets();
        if (res['success']===true)
        {
            let g = new ProcessHetergraph(res['graph']);
        }
    }

    drawchart = (g:any) => {
        console.log(g);
    }

    handleSelectDatasets = (e:any) =>{
        // redraw chart after selecting specify method
        this.setState({...this.state,datasets: String(e.target.value)})
    }

    componentDidMount = () =>{
        this.getInitDatasets();
    }


    render (){
        return(
           <Grid container spacing={3}>
            <Grid item xs={3}>
                        <FormControl sx={{ m: 1 ,minWidth:160}}>
                        <InputLabel id='select-helper-label'>Datasets</InputLabel>
                        <Select
                        labelId="select-helper-label"
                        label="Datasets"
                        value={this.state.datasets}
                        autoWidth
                        onChange={(e)=>{
                            this.handleSelectDatasets(e)
                        }}
                        >
                        <MenuItem value='None'>
                            <em>None</em>
                        </MenuItem>
                        {/* {
                            this.state.given_methods.map((method:any)=>
                            <MenuItem value={method} key={method}>{method}</MenuItem>
                            )
                        } */}
                        </Select>
                        </FormControl>
                    </Grid>
            <h1>hello</h1>
            <Grid item container id='present' xs={12}>

            </Grid>
           </Grid>
        )
    }
}
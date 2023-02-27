import React from "react";
import FDG from '../d3/FDG'
import { get9BAs,selectBA } from '../service/dataService';
import {processHeter} from "./ProcessHetergraph";
import { Button, Grid,Box,TextField, Typography } from '@mui/material';

var d3 = require("d3");
const labelinfo = [
    "Only BA graph. No motifs",
    "2 pentagons",
    "1 pentagon + 1 house",
    "2 houses"
]

export interface IProps {
    changeNext : any,
    updatePage : any,
    updateParams : any,
}


export interface IState {
    bas : any,
    nodes_num : number,
    m : number,
    disabled_id : any,
    labels : any,
    IsSelect : boolean,
    graphs : any,
    default_idx : number
}

export default class Gen9BAs extends React.Component<IProps,IState>
{
    constructor(props:any)
    {
        super(props)
        this.state =
        {
            bas : [1,2,3,4,5,6,7,8,9],
            nodes_num : 50,
            m : 5,
            disabled_id : [],
            labels : [],
            IsSelect : false,
            graphs : null,
            default_idx : NaN
        }
        
    }


    async getBA(nodes_num:number,m:number) {
        // given nodes num and m, receive results from backend and draw graphs
        let res = await get9BAs(nodes_num,m);
        if (res['success'] === true){
            let ret:any = [];
            for (let k in res['BAs'])
            {
                ret.push(processHeter(res['BAs'][k]));
            }
            let cret = this.drawChart(ret)
            this.setState({...this.state,disabled_id:cret.disabled_id,labels:cret.labels,graphs:ret,default_idx:cret.default_idx})
            this.props.updateParams(undefined,undefined,undefined,ret[cret.default_idx],ret,false)
        }
        else{
            alert("Something goes wrong when fetching BA graphs")
        }
    
    }

    async selectBA(id:number) {
        // send id to backend
        let res = await selectBA(id);
        if (res['success'] === true){
            this.props.changeNext(true)
        }
        else{
            console.log('wrong',res)
            alert("Something goes wrong when selected BA graph. Please try again")
        }
    }

    componentDidMount = () =>{
        // intial parameters using props function
        let parmas = this.props.updateParams();
        
        if (parmas.graphs !== null){
            let ret = this.drawChart(parmas.graphs)
            this.props.changeNext(false)
            this.setState({...this.state,nodes_num:parmas.num_nodes,m:parmas.m,graphs:parmas.graphs,disabled_id:ret.disabled_id,labels:ret.labels});
        }
    }

    componentWillUnmount = () =>{
        if (this.state.IsSelect === false)
        {
            this.handleSelect(this.state.default_idx+1)
        }
    }

    handleSelect = (id:number) =>{
        // given graph id, send it to backend and save selected graph to frontend cache
        if (this.state.disabled_id.includes(id))
        {
            alert("This graph is only for prensentation use and doesn't have motifs. Please select other graphs. ")
            return
        }
        this.selectBA(id) 
        this.props.updateParams(undefined,undefined,undefined,this.state.graphs[id-1],this.state.graphs,undefined,2)
    }

    drawChart = (data:any) =>{
        const prev = d3.select("body").select("#presentarea");
        prev.selectAll("svg").remove();
        let disabled_id = [];
        let labels = [];
        let default_idx = 0;
        for (let k in data)
        {
            if (data[k].label !== 0)
            {
                default_idx = Number(k);
                break;
            }
        }

        for (let k in data)
        {
            let id = +k+1
            let after = prev.select("#present"+id)
            FDG({prev:after,nodes:data[k].nodes,links:data[k].edges})
            // 显示div框，并设置样式
            after.style("visibility","visible")
                .style("border","solid 1px #2196f3")
                .on('mouseover',()=>{after.style("border","solid 5px #2196f3")})
                .on('mouseout',()=>{after.style("border","solid 1px #2196f3")})
            if (data[k].label===0)
            {
                disabled_id.push(+k+1)
            }

            labels.push(data[k].label)
           }
        
        return {
            disabled_id:disabled_id,
            labels:labels,
            default_idx : default_idx
        }
    }

    handleClick = () =>
    {
        // send nodes num and m to backend and receive ba graphs
        // verify the input
        if (isNaN(this.state.nodes_num) || this.state.nodes_num < 10 + 2*this.state.m)
        {
            alert("Invalid nodes num! Must >= 10 + 2m!")
            return
        }
        if (isNaN(this.state.m) || this.state.m <= 0)
        {
            alert("Invalid m!")
            return
        }
        if (this.state.nodes_num <= this.state.m)
        {
            alert("Need nodes num bigger than m!")
            return
        }
        this.getBA(this.state.nodes_num,this.state.m)
        this.props.updateParams(this.state.nodes_num,this.state.m)  // update params in global
    }

    render(){
        return(
        
        <Grid container spacing={3}>

            <Grid item
            component="form"
            sx={{
                '& > :not(style)': { m: 1 },
            }}
            >
            <TextField
                name="num_nodes"
                label="number of nodes"
                placeholder="recommend <=100 "
                defaultValue={this.state.nodes_num}
                inputProps = {{
                    type : 'number',
                    min : 12
                }}
                onChange={(e)=>{this.setState({...this.state,nodes_num:Number(e.target.value)})}}
                />
            <TextField
                name="m"
                label="m"
                placeholder="recommend >=5 "
                defaultValue={this.state.m}
                inputProps = {{
                    type : 'number'
                }}
                onChange={(e)=>{this.setState({...this.state,m:Number(e.target.value)})}}
                />
            <Button variant="outlined" size="large" onClick={this.handleClick}>Generate new BA graphs</Button>
            </ Grid>
            
            <Grid id='presentarea' item container spacing={2}>
            {
                this.state.bas.map((id:any) => 
                <Grid item xs={4} key={id} id={'present'+id} style={{visibility:"hidden"}} sx={{'& > :not(style)': { m: 1 }}}>
                    <Button variant="contained" id={'button'+id} onClick={()=>{this.handleSelect(id)}}>Select this Graph</Button>
                    <Typography> {labelinfo[this.state.labels[id-1]]} </Typography>
                </Grid>
                )
            }    
            </Grid>
        </Grid>
        )
    }
}
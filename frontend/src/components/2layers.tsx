import React from "react";
import FDG from '../d3/FDGs'
import ForceGraph from "../d3/FDG";
import { getFeatures,selectBA } from '../service/dataService';
import {ProcessHetergraph,processHeter} from "./ProcessHetergraph";
import { Button, Grid,Box,TextField, Typography, Hidden, FormHelperText } from '@mui/material';


var d3 = require("d3");

export interface IProps {
    changeNext : any,
    updateParams : any
}


export interface IState{
    graph : any,
    display_id : any,
    readout : number,
    theta1_2 : number
}

const layerinfo = [
    'Input',
    'Layer 1',
    'Layer 2'
]

export default class GenGraphFeatures extends React.Component<IProps,IState>
{
    constructor(props:any)
    {
        super(props);
        this.state = {
            graph : null,
            display_id : [2,1,0], //this means you will create 3 graphs id 0-2
            readout : -1,
            theta1_2: 3
        }
    }  

    drawChart = (data:any,readout:number) =>{
        d3.select('body').select('#before_present').style('visibility','hidden');
        d3.select('body').select('#before_present').selectAll('svg').remove();
        const prev = d3.select('body').select('#presentarea')
        prev.selectAll('svg').remove()
        // draw 3 Force directed graph
        let after = []
        for (let i of this.state.display_id)
        {
            after.push(prev.select('#present'+i))
        }
        let g = {nodes:data.nodes,links:data.edges}
        let gs = FDG(after[2],after[1],after[0],g) //to modify parameters , please directly modify in FDGs
        this.setState({...this.state,graph:gs,readout:readout})
        prev.style("visibility","visible")
        
        prev.select('#readout').select('#readouttext')
            .on('mouseover',this.OnReadout)
            .on('mouseout',this.OffReadout)
        
        prev.selectAll('.present').style("border","solid 1px #2196f3")
    }
    async getFeatures(theta:number) {
        let res = await getFeatures(theta);
        if (res['success'] === true){
            let g = new ProcessHetergraph(res['graph'])
            this.drawChart(g,res['graph'].readout)
        }
        else{
            alert("Something goes wrong when fetching BA graphs")
        }
    }

    async selectBA(id:number) {
        // send id to backend
        let res = await selectBA(id);
        if (res['success'] === true){
            // draw selected graph before setting theta
            let g = processHeter(res['graph'])
            let nodes = g.nodes
            let links = g.edges
            let prev = d3.select('body').select('#before_present').select('#selected_graph').style("border","solid 1px #2196f3");
            ForceGraph({prev,nodes,links})
            this.props.updateParams(undefined,undefined,undefined,g)
        }
        else{
            console.log('wrong',res)
            alert("Something goes wrong when selected BA graph. Please try again")
        }
    }

    OnReadout = () =>{
        this.state.graph.showReadout(1)
    }

    OffReadout = () =>{
        this.state.graph.showReadout(0)
    }

    handleClick = () =>{
        this.getFeatures(this.state.theta1_2)
        this.props.updateParams(undefined,undefined,this.state.theta1_2,undefined,undefined,false) //update params in global
        
    }

    componentDidMount = () =>{
        let params = this.props.updateParams();
        let links = params.selected_graph.edges;
        let nodes = params.selected_graph.nodes;
        // draw selected graph before setting theta
        let prev = d3.select('body').select('#before_present').select('#selected_graph').style("border","solid 1px #2196f3");
        ForceGraph({prev,nodes,links})

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
                name="θ1 for the second layer"
                label="θ1 for the second layer"
                placeholder="recommend <= 2+m/4 "
                defaultValue={this.state.theta1_2}
                inputProps={{
                    type:'number'
                }}
                onChange={(e)=>{this.setState({...this.state,theta1_2:Number(e.target.value)})}}
                />
            <Button variant="outlined" size="large" onClick={this.handleClick}>OK</Button>
            <FormHelperText> recommend less than 2+m/4 to get reasonable result</FormHelperText>
            
            </ Grid>

            <Grid container item xs={12} id='before_present' style={{alignContent:"center",justifyContent:"center"}}>
                <Grid item xs={6} id='selected_graph'>

                </Grid>
            </Grid>

                <Grid id='presentarea' item container spacing={3} xs={12} style={{visibility:"hidden"}}>
                <Grid container className="present" item xs={6} id='readout' style={{alignContent:"center",justifyContent:"center"}}>
                        <Grid item id='readouttext'>
                        <Typography variant="h4"  >Readout = {this.state.readout} </Typography>
                        </Grid>
                    
                </Grid>
                {
                    
                    this.state.display_id.map((id:any)=>
                    <Grid className="present"  item xs={6} key={id} id={'present'+id} >
                        <Typography>{layerinfo[id]} </Typography>
                    </Grid>
                    )
                }
                    
                </Grid>
            </Grid>
        )
    }
}
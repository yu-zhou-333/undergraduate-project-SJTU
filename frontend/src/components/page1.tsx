import React from "react";
import { getDatasets,uploadGraph} from '../service/dataService';
import {ProcessHetergraph} from "./ProcessHetergraph";
import { Button, Grid,Box,TextField, Typography,FormControl,InputLabel,Select,MenuItem,Slider,Input,Alert, CircularProgress, AlertTitle } from '@mui/material';
import ForceGraph from "../d3/FDG";
import OpeningGraphs from "../d3/Opening";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools";

var d3 = require("d3");

export interface IProps {

}


export interface IState {
    selected_dataset: string,
    graph_names : string[],
    graphs : any,
    upload_graph : string,
    node_feature: string,
    selected_graph_features : string[],
    selected_graph_nfeature: string,
    bins : any,
    IsGraphDisplayed : boolean,
    NodeID : number,
    Hop : number,
    graph_painter : any
}

export default class Page1 extends React.Component <IProps,IState>
{
    constructor(props:any)
    {
        super(props);
        this.state = {
            selected_dataset : '',
            graph_names:[],
            graphs : {},
            bins : 2,
            node_feature : '',
            upload_graph : 'None',
            selected_graph_features : [],
            selected_graph_nfeature : '',
            IsGraphDisplayed : false,
            NodeID : 0,
            Hop : 3,
            graph_painter : undefined
        }
    }
    async getInitDatasets(){
        let res = await getDatasets();
        if (res['success']===true)
        {
            console.log(res['graph']);
            
            let names = [];
            let graphs:any = {};
            for(let k in res['graph'])
            {
                let g = new ProcessHetergraph(res['graph'][k]);
                names.push(k);
                graphs[k] = g;
            }

            this.setState({...this.state,graphs:graphs,graph_names:names});
            console.log(graphs);
        }
    }

    async getUploadedGraph(g:any){
        alert("Successfully uploaded!")
        let res = await uploadGraph(g);
        if (res['success']===true){
            alert("Your graph now available")
            let graphs = this.state.graphs;
            let names = this.state.graph_names;
            for(let k in res['graph'])
            {
                let g = new ProcessHetergraph(res['graph'][k]);
                names.push(k);
                graphs[k] = g;
            }
            this.setState({...this.state,graphs:graphs,graph_names:names})
        }
        else{
            alert("Failed to upload! Please upload a dgl graph!")
        }
    }

    drawchart = (graphname:string) => {
        const prev = d3.select("body").select("#graph");
        prev.selectAll("svg").remove();
        let g = this.state.graphs[graphname];
        console.log(g);
        let nodes= g.nodes;
        let links = g.edges;
        ForceGraph({prev,nodes,links},)
    }

    handleSelectDatasets = (e:any) =>{
        // redraw chart after selecting specify method
        console.log(this.state.graphs[String(e.target.value)],String(e.target.value))
        let graph_features = this.state.graphs[String(e.target.value)].nfeatures
        console.log('graph features',graph_features)
        this.setState({...this.state,selected_dataset: String(e.target.value),selected_graph_features:graph_features,
        selected_graph_nfeature:''})
    }

    handleSelectNfeature = (e:any) => {
        
        let g = this.state.graphs[this.state.selected_dataset]
        let data = {
            nodes : g.nodes,
            links : g.edges
        }
        let nfeature = g.nfeatures_map[String(e.target.value)]
        let painter = this.drawOpening(data,nfeature,0,'InitialSample')
        this.setState({...this.state,selected_graph_nfeature:String(e.target.value),
            IsGraphDisplayed:true,graph_painter:painter})
    }

    handleBlur = () => {
        // handle when bins out of range
        if (this.state.bins < 2) {
          this.setState({...this.state,bins:2})
        } else if (this.state.bins > 1000) {
          this.setState({...this.state,bins:1000})
        }
    };

    handleBlur_NodeID = () => {
        if (this.state.NodeID < 0){
            this.setState({...this.state,NodeID : 0})
        }
    }

    handleBlur_Hop = () => {
        if (this.state.Hop < 0){
            this.setState({...this.state,Hop:0})
        } else if (this.state.Hop>10){
            this.setState({...this.state,Hop:10})
        }
    }

    drawOpening = (data?:any,nfeature?:string,bins?:number|number[],DisplayLabel?:string) => {
        let g = this.state.graphs[this.state.selected_dataset];
        if (!data){
            data = {
                nodes : g.nodes,
                links : g.edges
            }
        }
        if (!bins) bins = this.state.bins;
        if (!nfeature) nfeature = g.nfeatures_map[this.state.selected_graph_nfeature];
        if (!DisplayLabel) DisplayLabel = undefined;
        console.log('data',data);

        const prev = d3.select("body").select('#Grapharea')
        const prevBar = prev.select("#Bar");
        const prevFdg = prev.select("#Fdg");
        prev.selectAll("svg").remove();
        const windowWidth = document.body.clientWidth
        const windowHeight = window.innerHeight
        let painter = OpeningGraphs(prevBar, prevFdg,data,{nfeature:nfeature,bins:bins,hist_label:this.state.selected_graph_nfeature,
        width:windowWidth,height:windowHeight},{Display_label:DisplayLabel})
        painter.drawGraph();
        painter.update_hop(this.state.Hop);
        return painter;
    }


    uploadGraph = (e:any) => {
        let file = e.target.files[0];
        this.setState({...this.state,upload_graph:file.name})
        this.getUploadedGraph(file)   
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
                value={this.state.selected_dataset}
                autoWidth
                onChange={(e)=>{
                    this.handleSelectDatasets(e)
                }}
                >
                <MenuItem value='None'>
                    <em>None</em>
                </MenuItem>
                {
                    this.state.graph_names.map((method:any)=>
                    <MenuItem value={method} key={method}>{method}</MenuItem>
                    )
                }
                </Select>
                </FormControl>
            </Grid>
            <Grid item xs={3}>
                <FormControl sx={{ m: 1 ,minWidth:160}}>
                <InputLabel id='select-helper-label'>Features</InputLabel>
                <Select
                labelId="select-helper-label"
                label="Features"
                value={this.state.selected_graph_nfeature}
                autoWidth
                onChange={(e)=>{
                    this.handleSelectNfeature(e)
                }}
                >
                <MenuItem value='None'>
                    <em>None</em>
                </MenuItem>
                {
                    this.state.selected_graph_features.map((method:any)=>
                    <MenuItem value={method} key={method}>{method}</MenuItem>
                    )
                }
                </Select>
                </FormControl>
            </Grid>

            <Grid container item xs={3}  spacing={1}>
                <Grid item xs={12}>
                <Typography id="bin-input-slider" gutterBottom>
                    Bins
                </Typography>
                </Grid>
                <Grid item xs={8}>
                <Slider
                    value={typeof this.state.bins === 'number' ? this.state.bins : 2}
                    onChange={(e:Event,newValue:number|number[])=>{
                        if (this.state.selected_graph_nfeature!=='')
                        {
                            this.setState({...this.state,bins:newValue,IsGraphDisplayed:true});
                            this.drawOpening(0,'',newValue,'InitialSample')
                        }
                    }}
                    max = {1000}
                    min = {2}
                    aria-labelledby="bin-input-slider"
                />
                </Grid>
                <Grid item xs={4}>
                <Input
                    value={this.state.bins}
                    size="small"
                    onChange={(e)=>{
                        if (this.state.selected_graph_nfeature!=='')
                        {
                            this.setState({...this.state,bins:Number(e.target.value),IsGraphDisplayed:true})
                            this.drawOpening(0,'',Number(e.target.value),'InitialSample')
                        }
                    }}
                    onBlur={this.handleBlur}
                    inputProps={{
                    step: 1,
                    min: 2,
                    max: 1000,
                    type: 'number',
                    'aria-labelledby': 'bin-input-slider',
                    }}
                />
                </Grid>
            </Grid>

            <Grid item xs={2}>
            <Button variant="contained" component="label" >
                Upload
                <input hidden accept="MIME_type" multiple type="file" onChange={this.uploadGraph} />
            </Button>
            </Grid>
            <h1>{this.state.upload_graph}</h1>

            <Grid item container id='Grapharea' xs={12} spacing={1}>
            {this.state.IsGraphDisplayed && 
                    (
                    <Grid item container xs = {6} spacing={2}>
                        <Grid item xs={6}>
                        <InputLabel id='select-helper-label'>NodeID</InputLabel>
                            <Input
                                value={this.state.NodeID}
                                size="small"
                                onChange={(e)=>{
                                    this.setState({...this.state,NodeID:Number(e.target.value),IsGraphDisplayed:true});
                                    let painter = this.state.graph_painter;
                                    painter.update_nid(Number(e.target.value));
                                    painter.update_fdgnodes();
                                    painter.drawFDG();
                                }}
                                onBlur={this.handleBlur_NodeID}
                                inputProps={{
                                step: 1,
                                min: 0,
                                type: 'number',
                                'aria-labelledby': 'bin-input-slider',
                                }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                        <InputLabel id='select-helper-label'>Hop</InputLabel>
                        <Input
                            value={this.state.Hop}
                            size="small"
                            onChange={(e)=>{
                                this.setState({...this.state,Hop:Number(e.target.value),IsGraphDisplayed:true})
                                let painter = this.state.graph_painter;
                                painter.update_hop(Number(e.target.value));
                                painter.update_fdgnodes();
                                painter.drawFDG();
                            }}
                            onBlur={this.handleBlur_Hop}
                            inputProps={{
                            step: 1,
                            min: 0,
                            max: 10,
                            type: 'number',
                            'aria-labelledby': 'bin-input-slider',
                            }}
                        />
                        </Grid>
                    </Grid>
                    )
                }
                <Grid item className="graphs" container id='Fdg' xs={12}>
                
                </Grid>
                <Grid item className="graphs" container id='Bar' xs={12}></Grid>
                

            </Grid>
           </Grid>
        )
    }
}
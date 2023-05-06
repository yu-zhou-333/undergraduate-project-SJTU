import React from "react";
import { getDatasets,uploadGraph} from '../service/dataService';
import {ProcessHetergraph} from "./ProcessHetergraph";
import { Button, Grid,Box,TextField, Typography,FormControl,InputLabel,Select,MenuItem,Slider,Input,Alert, CircularProgress, AlertTitle,
Checkbox,ListItemText } from '@mui/material';
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
    selected_graph_features : string[],
    selected_graph_nfeature: string,
    graph_groups : string[],
    edge_features : string[],
    selected_edge_feature : string,
    selected_graph_groups:string[],
    bins : any,
    IsGraphDisplayed : boolean,
    NodeID : number,
    Hop : number,
    graph_painter : any,
    highlight_fdg_nodes : any
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
            upload_graph : 'None',
            selected_graph_features : [],
            selected_graph_nfeature : '',
            edge_features : [],
            selected_edge_feature : '',
            selected_graph_groups : [],
            graph_groups : [],
            IsGraphDisplayed : false,
            NodeID : 0,
            Hop : 1,
            graph_painter : undefined,
            highlight_fdg_nodes : [],
        }
    }
    async getInitDatasets(){
        let res = await getDatasets();
        if (res['success']===true)
        {
            console.log(res['graph']);
            
            let names = this.state.graph_names;
            let graphs:any = this.state.graphs;
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
        let g = this.state.graphs[String(e.target.value)];
        let graph_features = g.nfeatures;
        let edge_features = g.edgemask_type;
        console.log('graph features',graph_features,edge_features)
        this.setState({...this.state,selected_dataset: String(e.target.value),selected_graph_features:graph_features,
        edge_features:edge_features,selected_graph_nfeature:'',selected_graph_groups:[],highlight_fdg_nodes:[],
        selected_edge_feature:'',Hop:1})
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
            selected_edge_feature:'',selected_graph_groups:[],
            IsGraphDisplayed:true,graph_painter:painter})
    }
    
    handleSelectNgroups = (e:any) => {
        let g = this.state.graphs[this.state.selected_dataset]
        let data = {
            nodes : g.nodes,
            links : g.edges
        }
        console.log('nfeatures selected',e,e.target.value);
        let ngroups = e.target.value.map((d:any)=>g.nfeatures_map[String(d)])
        this.setState({...this.state,graph_groups:e.target.value,selected_graph_groups:ngroups})
    }

    // handleSelectNgroup = (e:any) => {
    //     let g = this.state.graphs[this.state.selected_dataset]
    //     let data = {
    //         nodes : g.nodes,
    //         links : g.edges
    //     }
    //     let nfeature = g.nfeatures_map[String(e.target.value)]
    //     let painter = this.state.graph_painter;
    //     painter.drawGraph(undefined,undefined,this.state.highlight_fdg_nodes,
    //     this.state.bins,nfeature,this.state.selected_edge_feature);
    //     this.setState({...this.state,selected_graph_group:String(e.target.value),
    //         IsGraphDisplayed:true,graph_painter:painter})
    // }

    handleSelectEfeature = (e:any) => {
        let g = this.state.graphs[this.state.selected_dataset]
        let efeature = String(e.target.value)
        let painter = this.state.graph_painter;
        painter.drawGraph(undefined,undefined,this.state.highlight_fdg_nodes,
        this.state.bins,undefined,efeature);
        this.setState({...this.state,
            IsGraphDisplayed:true,graph_painter:painter,selected_edge_feature:efeature})
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
        const prevFdg = prev.select("#Fdg")
                                .on('updateHighlightFDGNodes',(d:any)=>{
                                    let info = d.detail;
                                    this.setState({...this.state,highlight_fdg_nodes:info.nodes})
                                });
        prev.selectAll("svg").remove();
        const windowWidth = document.body.clientWidth
        const windowHeight = window.innerHeight

        let nidButton = d3.select("body").select("#nidButton")
                            .on("updateValue",(d:any)=>{
                                let info = d.detail;
                                this.setState({...this.state,NodeID:info.nid,Hop:info.hop})
                            });
        let hopButton = d3.select("body").select("#hopButton");

        let painter = OpeningGraphs(prevBar, prevFdg,data,{nfeature:nfeature,hist_label:this.state.selected_graph_nfeature,
        width:windowWidth,height:windowHeight},{Display_label:DisplayLabel},undefined,
        {nidButton:nidButton,hopButton:hopButton})
        painter.drawGraph(undefined,undefined,this.state.highlight_fdg_nodes,bins);
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
            <Grid item xs={2}>
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
                <MenuItem value=''>
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
            <Grid item xs={2}>
                <FormControl sx={{ m: 1 ,minWidth:160}}>
                <InputLabel id='select-helper-label'>NFeatures</InputLabel>
                <Select
                labelId="select-helper-label"
                label="Features"
                value={this.state.selected_graph_nfeature}
                autoWidth
                onChange={(e)=>{
                    this.handleSelectNfeature(e)
                }}
                >
                <MenuItem value=''>
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

            <Grid xs={2} item>
                <FormControl sx={{ m: 1 ,minWidth:160,maxWidth:200}}>
                <InputLabel >Groups</InputLabel>
                <Select
                labelId="multiple-checkbox-label"
                id="Groups"
                multiple
                value={this.state.graph_groups}
                onChange={this.handleSelectNgroups}
                renderValue={(selected) => selected.join(', ')}
                >
                {this.state.selected_graph_features.map((method) => (
                    <MenuItem key={method} value={method}>
                    <Checkbox checked={this.state.graph_groups.indexOf(method) > -1} />
                    <ListItemText primary={method} />
                    </MenuItem>
                ))}
                </Select>
                </FormControl>
            </Grid>
            

            <Grid item xs={2}>
                <FormControl sx={{ m: 1 ,minWidth:160}}>
                <InputLabel id='select-helper-label'>EFeatures</InputLabel>
                <Select
                labelId="select-helper-label"
                label="EFeatures"
                value={this.state.selected_edge_feature}
                autoWidth
                onChange={(e)=>{
                    this.handleSelectEfeature(e)
                }}
                >
                <MenuItem value=''>
                    <em>None</em>
                </MenuItem>
                {
                    this.state.edge_features.map((method:any)=>
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
                            let painter = this.drawOpening(0,'',newValue,'InitialSample')
                            this.setState({...this.state,bins:newValue,IsGraphDisplayed:true,NodeID:0,Hop:1,
                            graph_painter:painter});
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
                            let painter = this.drawOpening(0,'',Number(e.target.value),'InitialSample');
                            this.setState({...this.state,bins:Number(e.target.value),IsGraphDisplayed:true,
                                NodeID:0,Hop:1,graph_painter:painter})
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

            <Grid item container id='FDGControl' xs = {6} spacing={2}>
                <Grid item xs={3}>
                    <InputLabel id='select-helper-label'>NodeID</InputLabel>
                    <Input
                        value={this.state.NodeID}
                        size="small"
                        id = "nidButton"
                        
                        onChange={(e)=>{
                            console.log("nid input value changed");
                            let g = this.state.graphs[this.state.selected_dataset];
                            let painter = this.state.graph_painter;
                            // painter.update_nid(Number(e.target.value));
                            // painter.update_fdgnodes();
                            painter.drawGraph(Number(e.target.value),this.state.Hop,this.state.highlight_fdg_nodes,
                            this.state.bins,undefined,this.state.selected_edge_feature);
                            this.setState({...this.state,NodeID:Number(e.target.value),IsGraphDisplayed:true,
                            graph_painter:painter});
                        }}
                        onBlur={this.handleBlur_NodeID}
                        inputProps={{
                        step: 1,
                        min: 0,
                        type: 'number',
                        }}
                    />
                </Grid>
                <Grid item xs={3}>
                <InputLabel id='select-helper-label'>Hop</InputLabel>
                <Input
                    value={this.state.Hop}
                    size="small"
                    id = "hopButton"
                    onChange={(e)=>{
                        let hop = Number(e.target.value);
                        if(hop>10)hop=10;
                        let painter = this.state.graph_painter;
                        let g = this.state.graphs[this.state.selected_dataset];
                        // painter.update_hop(Number(e.target.value));
                        // painter.update_fdgnodes();
                        painter.drawGraph(this.state.NodeID,hop,this.state.highlight_fdg_nodes,
                        this.state.bins,undefined,this.state.selected_edge_feature);
                        this.setState({...this.state,Hop:hop,IsGraphDisplayed:true,
                        graph_painter:painter})
                    }}
                    onBlur={this.handleBlur_Hop}
                    inputProps={{
                    step: 1,
                    min: 0,
                    max: 10,
                    type: 'number',
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


            <Grid item container id='Grapharea' xs={12} spacing={1}>
                <Grid item className="graphs" container id='Fdg' xs={12}>
                
                </Grid>
                <Grid item className="graphs" container id='Bar' xs={12}></Grid>
                

            </Grid>
           </Grid>
        )
    }
}
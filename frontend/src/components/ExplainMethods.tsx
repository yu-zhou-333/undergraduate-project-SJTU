import React from "react";
import ExplainGraphs from "../d3/ExplainGraph";
import { getExplain,uploadExplainMethod } from '../service/dataService';
import {ProcessHetergraph} from "./ProcessHetergraph";
import AceEditor from "react-ace"
import { Button, Grid,Box,TextField, Typography,FormControl,InputLabel,Select,MenuItem,Slider,Input,Alert, CircularProgress, AlertTitle } from '@mui/material';
import { function_text } from "./texts";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools";

var d3 = require("d3");

export interface IProps {
    changeNext : any,
    updateParams : any
}


export interface IState {
    theta1_2 : number,
    method : string,
    given_methods: any,
    graph : any,
    bins : any,
    accs : any,
    dataProcess : any,
    IsLoading : boolean,
    showCodeBlock : boolean,
    CodeText : any,
    CodeError: string
}

export default class GenExplainMethods extends React.Component <IProps,IState>
{
    constructor(props:any)
    {
        super(props)
        this.state = {
            theta1_2 : NaN,
            method : 'None',
            given_methods : [],
            graph : null,
            bins : 1,
            accs : {},
            dataProcess : null,
            IsLoading : true,
            showCodeBlock : false,
            CodeText : function_text,
            CodeError: ''
        }
    }


    drawChart = (data?:any,method?:string,bins?:number|number[]) => {
        if (!data) data = this.state.graph;
        if (!method) method = this.state.method;
        if (!bins) bins = this.state.bins;

        const prev = d3.select('body').select('#presentarea')
        const prevFdg = prev.select('#Fdg')
        const prevHist = prev.select('#Bar')
        prev.selectAll('svg').remove()
        ExplainGraphs(prevHist,prevFdg,data,{method:method,bins:bins})
        prev.style("visibility","visible")
        prev.selectAll('.present').style("border","solid 1px #2196f3")
    }

    async getExplain(theta:number) {
        // get default explaination
        let res = await getExplain(theta);
        if (res['success']===true)
        {
            let g = this.state.dataProcess===null ? new ProcessHetergraph(res['graph']) : this.state.dataProcess;
            if (this.state.dataProcess !== null) g.addEdgeMask(res['graph']);
            let data = {
                nodes : g.nodes,
                links : g.edges
            }
            let accs = this.state.accs;
            for (let k in res['graph'].accs) {
                accs[k] = (res['graph'].accs[k]*100).toFixed(2);
            }   
            this.setState({...this.state,given_methods:g.edgemask_type,graph:data,dataProcess:g,accs:accs,IsLoading:false,CodeError:''})
            this.drawChart(data)
        }
        else{
            alert("Something goes wrong when calculating explain results")
        }
    }

    async getYourMethod(){
        // get DIY explaination
        let res = await uploadExplainMethod(this.state.CodeText);
        if (res['success']===true)
        {
            let g = this.state.dataProcess===null ? new ProcessHetergraph(res['graph']) : this.state.dataProcess;
            if (this.state.dataProcess !== null) g.addEdgeMask(res['graph']);
            let data = {
                nodes : g.nodes,
                links : g.edges
            }
            let accs = this.state.accs;
            for (let k in res['graph'].accs) {
                accs[k] = (res['graph'].accs[k]*100).toFixed(2);
            } 
            this.setState({...this.state,given_methods:g.edgemask_type,graph:data,dataProcess:g,accs:accs,IsLoading:false,method:'Your Method_edge_mask'})
            this.drawChart(data,'Your Method_edge_mask')
        }
        else{
            this.setState({...this.state,showCodeBlock:true,IsLoading:false,CodeError:res['info']});
            d3.select('body').select('#presentarea').style("visibility","hidden");
        }
    }


    handleSelectMethod = (e:any) =>{
        // redraw chart after selecting specify method
        this.setState({...this.state,method:String(e.target.value),IsLoading:false,showCodeBlock:false})
        this.drawChart(this.state.graph,e.target.value)
        d3.select('body').select('#presentarea').style('visibility','visible');
    }
    
    handleBlur = () => {
        // handle when bins out of range
        if (this.state.bins < 1) {
          this.setState({...this.state,bins:1})
        } else if (this.state.bins > 100) {
          this.setState({...this.state,bins:100})
        }
      };

    handleShowCodeBlock= () =>{
        // show code block after clicking write your method
        this.setState({...this.state,showCodeBlock:true,IsLoading:false});
        d3.select('body').select('#presentarea').style("visibility","hidden");
    }

    handleSubmitMethod = () =>{
        // submit method after clicking done
        this.setState({...this.state,showCodeBlock:false,IsLoading:true});
        this.getYourMethod()
    }

    componentDidMount = () =>{
        // get paramaters before the first render and draw default explanation
        let params = this.props.updateParams();
        if (isNaN(params.theta1_2))
        {
            this.setState({...this.state,IsLoading:false});
        }
        else{
            this.setState({...this.state,theta1_2:params.theta1_2});
            this.getExplain(params.theta1_2);
        }
    }


    render (){
        return(
            <Grid container rowSpacing={2}>
                
                <Grid item container xs={12}  >
                    <Grid item xs={3}>
                        <FormControl sx={{ m: 1 ,minWidth:160}}>
                        <InputLabel id='select-helper-label'>Explain Methods</InputLabel>
                        <Select
                        labelId="select-helper-label"
                        label="Explain Method"
                        value={this.state.method}
                        autoWidth
                        onChange={(e)=>{
                            this.handleSelectMethod(e)
                        }}
                        >
                        <MenuItem value='None'>
                            <em>None</em>
                        </MenuItem>
                        {
                            this.state.given_methods.map((method:any)=>
                            <MenuItem value={method} key={method}>{method}</MenuItem>
                            )
                        }
                        </Select>
                        </FormControl>
                    </Grid>
                    <Grid container item xs={2} style={{alignContent:"center"}}>
                        <Grid item>
                            <Typography> Accuracy = {this.state.accs[this.state.method]}% </Typography>
                        </Grid>
                    </Grid>

                   
                    <Grid container item xs={3}  spacing={1}>
                            <Grid item xs={12}>
                            <Typography id="bin-input-slider" gutterBottom>
                                Bins
                            </Typography>
                            </Grid>
                            <Grid item xs={8}>
                            <Slider
                                value={typeof this.state.bins === 'number' ? this.state.bins : 1}
                                onChange={(e:Event,newValue:number|number[])=>{
                                    this.setState({...this.state,bins:newValue});
                                    this.drawChart(this.state.graph,this.state.method,newValue)
                                }}
                                aria-labelledby="bin-input-slider"
                            />
                            </Grid>
                            <Grid item xs={4}>
                            <Input
                                value={this.state.bins}
                                size="small"
                                onChange={(e)=>{
                                    this.setState({...this.state,bins:Number(e.target.value)})
                                    this.drawChart(this.state.graph,this.state.method,Number(e.target.value))
                                }}
                                onBlur={this.handleBlur}
                                inputProps={{
                                step: 1,
                                min: 1,
                                max: 100,
                                type: 'number',
                                'aria-labelledby': 'bin-input-slider',
                                }}
                            />
                            </Grid>
                    </Grid>

                    <Grid item container xs={3} style={{alignContent:"center"}}>
                        <Grid item xs={12}>
                            <Button size="large" onClick={this.handleShowCodeBlock}> Write your method</Button>
                        </Grid>
                        
                    </Grid>

                </Grid>


                {
                    this.state.IsLoading && (
                    <Grid item container xs={12} spacing={1} style={{alignContent:"center",justifyContent:"center"}} height={400}>
                    <Grid item >
                    <CircularProgress size={100}/>
                    </Grid>
                    </Grid>
                    )
                }
                {
                    this.state.showCodeBlock && (
                        <Grid item container xs={12}  style={{alignContent:"center",justifyContent:"center"}} >
                            <Grid item xs={8} >
                                <AceEditor
                                    mode="python"
                                    theme="github"
                                    name="Your Explain Method"
                                    onChange={(e)=>{this.setState({...this.state,CodeText:String(e)})}}
                                    fontSize={14}
                                    showPrintMargin={true}
                                    showGutter={true}
                                    highlightActiveLine={true}
                                    value={this.state.CodeText}
                                    style={{width:'95%'}}
                                    setOptions={{
                                    enableBasicAutocompletion: true,
                                    enableLiveAutocompletion: true,
                                    enableSnippets: false,
                                    showLineNumbers: true,
                                    tabSize: 2
                                    }}/>
                                    <br/> 
                                    {
                                    
                                    this.state.CodeError === '' ? null:
                                    <Alert id='error_message' severity="error">
                                        <AlertTitle>Error</AlertTitle>
                                        {this.state.CodeError}
                                    </Alert>
                            }    
                            </Grid>
                            <Grid item xs={1}> 
                                    <Button size="large" variant="contained" onClick={this.handleSubmitMethod}>Submit</Button>
                            </Grid>
                            <Grid item xs={8}> 
                                  
                            </Grid>
                        </Grid>
                    )
                }

                <Grid item container xs={12} id='presentarea' spacing={0} style={{alignContent:"center",justifyContent:"center"}}>
                    
                    
                    <Grid className="present" item xs={6} id='Bar'>
                        {/* {this.state.IsLodaing && <Skeleton  height={document.getElementById('Bar')?.clientWidth}/>} */}
                    </Grid>
                    <Grid item className="present" xs={6} id="Fdg">
                        {/* {this.state.IsLodaing && <Skeleton height={document.getElementById('Fdg')?.clientWidth}/>} */}
                    </Grid>
                </Grid>

            </Grid>
        )
    }
}
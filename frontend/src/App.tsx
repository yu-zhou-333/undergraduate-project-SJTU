import * as React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid'
import MyNavigator from './components/navigation'
import {Display9ba,DisplayExplainRes,DisplayFeatures, PAGE1} from './pages/pages';

var IsPage1Terminate = false;

export interface AppState{
  page : number
  num_nodes : number|undefined,
  m : number|undefined,
  theta1_2 : number|undefined,
  selected_graph : any,
  graphs : any,
  disabled_next : boolean
}

export default class App extends React.Component<{},AppState> {
  constructor(props:any)
  {
    super(props);
    this.state = {
      page : 1,
      num_nodes : 50,
      m : 5,
      theta1_2 : 3,
      selected_graph : null,
      graphs : null,
      disabled_next : true
    }
    this.changePage = this.changePage.bind(this);
    this.updateParams = this.updateParams.bind(this);
    this.changeNext = this.changeNext.bind(this);
  }

  


  changePage = (pagenum:number) =>
  {
    if (this.state.page===1)
    {
      IsPage1Terminate = true;
    }
    this.setState({...this.state,page:pagenum,disabled_next:true},()=>{console.log('global',this.state)})
    
    
  }
  changeNext = (next_state:boolean)=>{
    this.setState({...this.state,disabled_next:next_state})
  }
  updateParams(num_nodes?:number,m?:number,theta1_2?:number,selected_graph?:any,graphs?:any,next_state?:boolean,page?:number)
  {
    // Receive parameters from children to set global state, and return the current state
    if(page===undefined) page=this.state.page;
    if(num_nodes === undefined) num_nodes = this.state.num_nodes;
    if(m === undefined) m = this.state.m;
    if(theta1_2 === undefined) theta1_2=this.state.theta1_2;
    if(selected_graph === undefined) selected_graph = this.state.selected_graph;
    if(next_state === undefined) next_state=this.state.disabled_next;
    if(graphs === undefined) graphs = this.state.graphs;
    this.setState({...this.state,m:m,num_nodes:num_nodes,theta1_2:theta1_2,disabled_next:next_state,selected_graph:selected_graph,page:page,
    graphs:graphs},
      ()=>(console.log('updateGlobal',this.state)))
    return {
      num_nodes:num_nodes,
      m : m,
      theta1_2:theta1_2,
      selected_graph:selected_graph,
      graphs:graphs
    }
  }

  // render() {
  //   return (
  //     <Box sx={{ flexGrow: 1 }} style={{margin:'15px'}} >
  //     <Grid container rowSpacing={3} columnSpacing={0} >
      
  //     <Grid item xs={12}>
  //     <MyNavigator step={this.state.page-1} changePage={this.changePage} next_state={this.state.disabled_next}/>
  //     </Grid>
  //     <Grid item xs={12} >

  //        {/* 条件渲染 true&&expression会返回expression； false&&expression会跳过 */}
  //       {
  //         this.state.page === 1 && <Display9ba updatePage={this.changePage} changeNext={this.changeNext} updateParams={this.updateParams} />
  //       }
  //       {
  //         this.state.page === 2 && <DisplayFeatures updatePage={this.changePage} changeNext={this.changeNext} updateParams={this.updateParams}/>
  //       }
  //       {
  //         this.state.page === 3 && <DisplayExplainRes updatePage={this.changePage} changeNext={this.changeNext} updateParams={this.updateParams}/>
  //       }
  //     </Grid>
  //     </Grid>
  //   </Box>
  //   );
  // }
  render() {
    return (
      <Box sx={{ flexGrow: 1 }} style={{margin:'15px'}} >
      <Grid container rowSpacing={3} columnSpacing={0} >
      
      <Grid item xs={12}>
      </Grid>
      <Grid item xs={12} >
        <PAGE1></PAGE1>
      </Grid>
      </Grid>
    </Box>
    );
  }
}
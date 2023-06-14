import * as React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid'
import {PAGE1} from './pages/pages';

var IsPage1Terminate = false;

export interface AppState{

}

export default class App extends React.Component<{},AppState> {
  constructor(props:any)
  {
    super(props);
    this.state = {}
  }

  

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
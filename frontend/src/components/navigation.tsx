import * as React from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { MathComponent } from "mathjax-react";


const steps = [
  {
    label: 'Prepare your data',
    description:
    <div>
      <Typography > You need to select a graph for visualization use. </Typography>
      <Typography > The graph is generated randomly by <a href='https://en.wikipedia.org/wiki/Barab%C3%A1si%E2%80%93Albert_model'>Barabási–Albert model</a></Typography>
    </div>
    
   ,
  },
  {
    label: 'Model presentation ',
    description:
    <div>
    <Typography> 
    Below graphs present the graph information in our 2 layers model. 
    </Typography>
    <Typography>   
    The first graph is the input state, all the node are given value 1. The second graph is the state after the first layer. 
    The thrid graph is the final state. Readout gives the sum of the positive node in the final state. 
    </Typography>
    <Typography variant='h6'>
      The formula for convolution is :
    </Typography>
    <MathComponent tex={String.raw`h_i^{(l+1)}=RELU(\theta_1^{(l)}h_i^{(l)}+\theta_2^{(l)}\sum_{j\in V(N_i)}h_j^{(l)})`}/>
    <MathComponent tex={String.raw`where \ \theta_1^{(1)}=\theta_2^{(1)}=1 \ and\ \theta_2^{(2)}=-1`}/>
    </div>
    
     ,
  },
  {
    label: 'Presentation of Explaination Methods',
    description: <div>
      <Typography>Below graphs present the result of the selected method. </Typography>
      <Typography>The bar chart gives the distribution of the edge value under the selected method. 
      You may brush to select the edge in the bar chart and see the corresponding edge in the force directed graph.
     </Typography>
     <Typography variant='h6'> The accuracy is given by:</Typography>
     <MathComponent tex="Accuracy = \frac{|E_{Explainer}\cap E_{GroundTruth}|}{|E_{GroundTruth}|}" />
    </div>,
  },
];


export default function HorizontalLinearStepper(props:{step:number,changePage:any,next_state:boolean}) {
  const [activeStep, setActiveStep] = React.useState(props.step);


  const handleReset = () => {
    setActiveStep(0);
  };

  const handleChangePage = (step:number) =>{
    props.changePage(step+1)
  }


  React.useEffect(()=>{setActiveStep(props.step);
    console.log('newpage',props.step)},
    [props.step])

  return (
    <Box sx={{ width: '100%' }}>
      <Stepper activeStep={activeStep}>
        {steps.map((step, index) => {
          const stepProps: { completed?: boolean } = {};
          const labelProps: {
            optional?: React.ReactNode;
          } = {};
          return (
            <Step key={step.label} {...stepProps}>
              <StepLabel {...labelProps}>{step.label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
      {activeStep === steps.length ? (
        <React.Fragment>
          <Typography sx={{ mt: 2, mb: 1 }}>
            All steps completed - you&apos;re finished
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
            <Box sx={{ flex: '1 1 auto' }} />
            <Button onClick={handleReset}>Reset</Button>
          </Box>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <Typography sx={{ mt: 2, mb: 1 }} variant='h5'>Step {activeStep + 1}</Typography>
          {steps[activeStep].description}
          <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
          <Button
                color="inherit"
                disabled={activeStep === 0}
                onClick={()=>handleChangePage(activeStep-1)}
                sx={{ mr: 1 }}
              >
                Back
              </Button>
              <Box sx={{ flex: '1 1 auto' }} />
              <Button  
              sx={{ mr: 1 }} 
              onClick={()=>handleChangePage(activeStep+1)}
              disabled={props.next_state}
              >
                Next
              </Button>
              
                
          </Box>
        </React.Fragment>
      )}
    </Box>
  );
}
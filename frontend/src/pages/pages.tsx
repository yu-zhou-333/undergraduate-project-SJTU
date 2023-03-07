import React from "react";
import Gen9BAs from "../components/9bas";
import GenFeatures from "../components/2layers"
import GenExplainMethods from "../components/ExplainMethods";
import Page1 from "../components/page1";

export interface PageProps {
    changeNext : any,
    updatePage : any,
    updateParams : any
}


export class Display9ba extends React.Component<PageProps,{}>
{
    constructor(props:any)
    {
        super(props);
    }
    render(){
        return(
            <Gen9BAs updatePage={this.props.updatePage}  changeNext={this.props.changeNext} updateParams={this.props.updateParams}/> 
        )
    }
}

export class DisplayFeatures extends React.Component<PageProps,{}>
{
    constructor(props:any)
    {
        super(props);
    }
    render(){
        return(
            <GenFeatures changeNext={this.props.changeNext} updateParams={this.props.updateParams}/> 
        )
    }
}

export class DisplayExplainRes extends React.Component<PageProps,{}>
{
    constructor(props:any)
    {
        super(props);
    }
    render(){
        return(
            <GenExplainMethods changeNext={this.props.changeNext} updateParams={this.props.updateParams}/> 
        )
    }
}

export class PAGE1 extends React.Component<{},{}>
{
    constructor(props:any)
    {
        super(props);
    }
    render(){
        return(
            <Page1/>
        )
    }
}